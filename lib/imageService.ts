import { supabase } from './supabaseClient'

export interface UploadImageResult {
  url: string
  error?: string
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadPlaneImage(
  planeId: number,
  file: File,
  userId: string
): Promise<UploadImageResult> {
  try {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { url: '', error: 'Filen er for stor. Maksimal størrelse er 5MB.' }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { url: '', error: 'Kun bildefiler er tillatt.' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${planeId}_${Date.now()}.${fileExt}`

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('plane-images')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('plane-images')
      .getPublicUrl(fileName)

    return { url: urlData.publicUrl }
  } catch (error: any) {
    console.error('Error uploading image:', error)
    return { url: '', error: error.message }
  }
}

/**
 * Save image metadata to database
 */
export async function saveImageMetadata(
  planeId: number,
  imageUrl: string,
  isThumbnail: boolean = false,
  displayOrder: number = 0
) {
  try {
    const { data, error } = await supabase
      .from('plane_images')
      .insert([
        {
          plane_id: planeId,
          image_url: imageUrl,
          is_thumbnail: isThumbnail,
          display_order: displayOrder
        }
      ])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error saving image metadata:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Set an image as thumbnail (and unset others)
 */
export async function setThumbnail(imageId: number, planeId: number) {
  try {
    // First, unset all thumbnails for this plane
    await supabase
      .from('plane_images')
      .update({ is_thumbnail: false })
      .eq('plane_id', planeId)

    // Then set the selected image as thumbnail
    const { error } = await supabase
      .from('plane_images')
      .update({ is_thumbnail: true })
      .eq('id', imageId)

    if (error) throw error
    return { success: true, error: null }
  } catch (error: any) {
    console.error('Error setting thumbnail:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete an image
 */
export async function deleteImage(imageId: number, imageUrl: string) {
  try {
    // Delete from database
    const { error: dbError } = await supabase
      .from('plane_images')
      .delete()
      .eq('id', imageId)

    if (dbError) throw dbError

    // Extract file path from URL and delete from storage
    const url = new URL(imageUrl)
    const filePath = url.pathname.split('/').slice(-2).join('/')
    
    const { error: storageError } = await supabase.storage
      .from('plane-images')
      .remove([filePath])

    if (storageError) {
      console.error('Error deleting from storage:', storageError)
    }

    return { success: true, error: null }
  } catch (error: any) {
    console.error('Error deleting image:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get image count for a plane
 */
export async function getImageCount(planeId: number): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('plane_images')
      .select('*', { count: 'exact', head: true })
      .eq('plane_id', planeId)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error getting image count:', error)
    return 0
  }
}


