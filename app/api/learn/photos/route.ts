import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Learn from "@/models/Learn";
import cloudinary from "@/lib/cloudinary";
import { v4 as uuidv4 } from 'uuid';

// GET - Fetch photos for a specific plan
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    
    if (!planId) {
      return NextResponse.json({ 
        success: false, 
        message: "Plan ID is required" 
      }, { status: 400 });
    }
    
    const plan = await Learn.findById(planId);
    
    if (!plan) {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่พบแผนกิจกรรม" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: plan.photos || []
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// POST - Upload photos to a specific plan
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const planId = formData.get('planId') as string;
    
    if (!planId) {
      return NextResponse.json({ 
        success: false, 
        message: "Plan ID is required" 
      }, { status: 400 });
    }
    
    const plan = await Learn.findById(planId);
    
    if (!plan) {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่พบแผนกิจกรรม" 
      }, { status: 404 });
    }
    
    const newPhotos: any[] = [];
    
    // Process uploaded photos
    for (let i = 0; formData.has(`photos[${i}]`); i++) {
      const file = formData.get(`photos[${i}]`) as File;
      
      if (file && file.size > 0) {
        // Upload to Cloudinary
        const buffer = Buffer.from(await file.arrayBuffer());
        
        const upload = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              folder: "activity_photos",
              resource_type: "image"
            }, 
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          ).end(buffer);
        });
        
        const photo = {
          id: uuidv4(),
          url: upload.secure_url,
          caption: '',
          createdAt: new Date().toISOString()
        };
        
        newPhotos.push(photo);
      }
    }
    
    // Update plan with new photos
    if (newPhotos.length > 0) {
      plan.photos = [...(plan.photos || []), ...newPhotos];
      plan.updated_at = new Date().toLocaleDateString('th-TH');
      await plan.save();
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `อัปโหลดรูปภาพ ${newPhotos.length} รูปเรียบร้อยแล้ว`,
      data: newPhotos
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// DELETE - Remove a specific photo
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const photoId = searchParams.get('photoId');
    
    if (!planId || !photoId) {
      return NextResponse.json({ 
        success: false, 
        message: "Plan ID and Photo ID are required" 
      }, { status: 400 });
    }
    
    const plan = await Learn.findById(planId);
    
    if (!plan) {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่พบแผนกิจกรรม" 
      }, { status: 404 });
    }
    
    const photoIndex = plan.photos?.findIndex((photo: any) => photo.id === photoId);
    
    if (photoIndex === -1 || photoIndex === undefined) {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่พบรูปภาพ" 
      }, { status: 404 });
    }
    
    // Remove photo from array
    plan.photos = plan.photos?.filter((photo: any) => photo.id !== photoId);
    plan.updated_at = new Date().toLocaleDateString('th-TH');
    await plan.save();
    
    return NextResponse.json({ 
      success: true, 
      message: "ลบรูปภาพเรียบร้อยแล้ว"
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
