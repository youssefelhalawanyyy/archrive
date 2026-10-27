import os
from PIL import Image, ImageDraw, ImageFont

def create_archive_icon(size=512, is_maskable=False):
    # Base image
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Scale factor
    s = size / 512.0
    
    bg_color = (15, 23, 42, 255) # Slate 900
    accent_blue = (37, 99, 235, 255) # Blue 600
    accent_cyan = (56, 189, 248, 255) # Sky 400
    card_bg = (248, 250, 252, 255) # Slate 50
    gold = (245, 158, 11, 255) # Amber 500
    
    if is_maskable:
        # Full bleed background for Android maskable icons
        draw.rectangle([0, 0, size, size], fill=bg_color)
        # Scale inner content slightly down into safe zone (safe area is 80% circle)
        inner_scale = 0.78
    else:
        # Rounded squircle for standalone icon
        corner_radius = int(108 * s)
        draw.rounded_rectangle([0, 0, size, size], radius=corner_radius, fill=bg_color)
        # Inner subtle border
        draw.rounded_rectangle([2*s, 2*s, size-2*s, size-2*s], radius=corner_radius-2, outline=(51, 65, 85, 255), width=int(3*s))
        inner_scale = 1.0

    # Center coordinates
    cx = size / 2.0
    cy = size / 2.0
    
    # Draw glowing accent halo
    halo_r = int(180 * s * inner_scale)
    draw.ellipse([cx - halo_r, cy - halo_r, cx + halo_r, cy + halo_r], fill=(30, 58, 138, 70))
    
    # Draw physical binder folder base
    bw = 270 * s * inner_scale
    bh = 320 * s * inner_scale
    bx = cx - bw/2.0
    by = cy - bh/2.0 + 10 * s * inner_scale
    
    # Folder spine (left side)
    spine_w = 58 * s * inner_scale
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=int(22*s*inner_scale), fill=(241, 245, 249, 255))
    
    # Binder spine background in deep blue
    draw.rounded_rectangle([bx, by, bx + spine_w, by + bh], radius=int(20*s*inner_scale), fill=accent_blue)
    # Clip right edge of spine to be straight
    draw.rectangle([bx + spine_w - 14*s*inner_scale, by, bx + spine_w, by + bh], fill=accent_blue)
    
    # Spine metal ring rivets
    rivet_x = bx + spine_w/2.0
    for ry in [by + 55*s*inner_scale, by + bh/2.0, by + bh - 55*s*inner_scale]:
        draw.ellipse([rivet_x - 8*s*inner_scale, ry - 8*s*inner_scale, rivet_x + 8*s*inner_scale, ry + 8*s*inner_scale], fill=(226, 232, 240, 255), outline=(30, 41, 59, 255), width=int(2*s))
        draw.ellipse([rivet_x - 4*s*inner_scale, ry - 4*s*inner_scale, rivet_x + 4*s*inner_scale, ry + 4*s*inner_scale], fill=(15, 23, 42, 255))

    # Colored Separator Tabs extending from top/right
    # Tab 1: Emerald (Health/Amn)
    t1_x = bx + spine_w + 30*s*inner_scale
    t1_w = 48*s*inner_scale
    t1_h = 24*s*inner_scale
    draw.rounded_rectangle([t1_x, by - 16*s*inner_scale, t1_x + t1_w, by + 12*s*inner_scale], radius=int(6*s*inner_scale), fill=(16, 185, 129, 255))
    
    # Tab 2: Amber (Edarat)
    t2_x = t1_x + t1_w + 14*s*inner_scale
    draw.rounded_rectangle([t2_x, by - 16*s*inner_scale, t2_x + t1_w, by + 12*s*inner_scale], radius=int(6*s*inner_scale), fill=gold)
    
    # Tab 3: Cyan (Asleha / Cap)
    t3_x = t2_x + t1_w + 14*s*inner_scale
    draw.rounded_rectangle([t3_x, by - 16*s*inner_scale, t3_x + t1_w, by + 12*s*inner_scale], radius=int(6*s*inner_scale), fill=accent_cyan)
    
    # Re-draw folder top edge to overlay tab bottoms cleanly
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=int(22*s*inner_scale), fill=None, outline=(203, 213, 225, 255), width=int(3*s))
    draw.rounded_rectangle([bx, by, bx + spine_w, by + bh], radius=int(20*s*inner_scale), fill=accent_blue)
    draw.rectangle([bx + spine_w - 14*s*inner_scale, by, bx + spine_w, by + bh], fill=accent_blue)
    for ry in [by + 55*s*inner_scale, by + bh/2.0, by + bh - 55*s*inner_scale]:
        draw.ellipse([rivet_x - 8*s*inner_scale, ry - 8*s*inner_scale, rivet_x + 8*s*inner_scale, ry + 8*s*inner_scale], fill=(226, 232, 240, 255), outline=(30, 41, 59, 255), width=int(2*s))
        draw.ellipse([rivet_x - 4*s*inner_scale, ry - 4*s*inner_scale, rivet_x + 4*s*inner_scale, ry + 4*s*inner_scale], fill=(15, 23, 42, 255))

    # Inner document sheet inside binder
    doc_x = bx + spine_w + 16*s*inner_scale
    doc_y = by + 28*s*inner_scale
    doc_w = bw - spine_w - 32*s*inner_scale
    doc_h = bh - 56*s*inner_scale
    
    # Document sheet in crisp white with border
    draw.rounded_rectangle([doc_x, doc_y, doc_x + doc_w, doc_y + doc_h], radius=int(10*s*inner_scale), fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=int(2*s))
    
    # Document header lines
    line_y = doc_y + 24*s*inner_scale
    draw.rounded_rectangle([doc_x + 20*s*inner_scale, line_y, doc_x + doc_w - 20*s*inner_scale, line_y + 12*s*inner_scale], radius=int(4*s), fill=(30, 41, 59, 255))
    line_y += 24*s*inner_scale
    draw.rounded_rectangle([doc_x + 20*s*inner_scale, line_y, doc_x + doc_w - 60*s*inner_scale, line_y + 8*s*inner_scale], radius=int(3*s), fill=(148, 163, 184, 255))
    line_y += 18*s*inner_scale
    draw.rounded_rectangle([doc_x + 20*s*inner_scale, line_y, doc_x + doc_w - 40*s*inner_scale, line_y + 8*s*inner_scale], radius=int(3*s), fill=(203, 213, 225, 255))

    # High-tech QR Code motif badge on lower right of document
    qr_box_size = 94*s*inner_scale
    qr_x = doc_x + (doc_w - qr_box_size)/2.0
    qr_y = doc_y + doc_h - qr_box_size - 24*s*inner_scale
    
    # QR badge container
    draw.rounded_rectangle([qr_x, qr_y, qr_x + qr_box_size, qr_y + qr_box_size], radius=int(10*s*inner_scale), fill=(15, 23, 42, 255), outline=(59, 130, 246, 255), width=int(2*s))
    
    # Mini QR pattern modules
    grid_n = 5
    cell = qr_box_size / 7.0
    # Corner marker 1 (top-left)
    draw.rectangle([qr_x + cell, qr_y + cell, qr_x + cell*3, qr_y + cell*3], fill=accent_cyan)
    draw.rectangle([qr_x + cell*1.5, qr_y + cell*1.5, qr_x + cell*2.5, qr_y + cell*2.5], fill=(15, 23, 42, 255))
    # Corner marker 2 (top-right)
    draw.rectangle([qr_x + cell*4, qr_y + cell, qr_x + cell*6, qr_y + cell*3], fill=accent_cyan)
    draw.rectangle([qr_x + cell*4.5, qr_y + cell*1.5, qr_x + cell*5.5, qr_y + cell*2.5], fill=(15, 23, 42, 255))
    # Corner marker 3 (bottom-left)
    draw.rectangle([qr_x + cell, qr_y + cell*4, qr_x + cell*3, qr_y + cell*6], fill=accent_cyan)
    draw.rectangle([qr_x + cell*1.5, qr_y + cell*4.5, qr_x + cell*2.5, qr_y + cell*5.5], fill=(15, 23, 42, 255))
    # Center bits
    draw.rectangle([qr_x + cell*3.5, qr_y + cell*3.5, qr_x + cell*4.5, qr_y + cell*4.5], fill=(255, 255, 255, 255))
    draw.rectangle([qr_x + cell*5, qr_y + cell*4.5, qr_x + cell*6, qr_y + cell*5.5], fill=(255, 255, 255, 255))
    
    # Smart digital badge indicator on bottom right corner of overall icon
    badge_r = 38 * s * inner_scale
    badge_x = bx + bw - 10 * s * inner_scale
    badge_y = by + bh - 10 * s * inner_scale
    draw.ellipse([badge_x - badge_r, badge_y - badge_r, badge_x + badge_r, badge_y + badge_r], fill=(16, 185, 129, 255), outline=(15, 23, 42, 255), width=int(4*s))
    # White checkmark inside badge
    chk_w = int(5*s*inner_scale)
    draw.line([badge_x - 14*s*inner_scale, badge_y, badge_x - 4*s*inner_scale, badge_y + 11*s*inner_scale], fill=(255, 255, 255, 255), width=chk_w)
    draw.line([badge_x - 4*s*inner_scale, badge_y + 11*s*inner_scale, badge_x + 16*s*inner_scale, badge_y - 12*s*inner_scale], fill=(255, 255, 255, 255), width=chk_w)
    
    return img

os.makedirs("public/icons", exist_ok=True)

# 1. 512x512 Standard Icon
img_512 = create_archive_icon(512, is_maskable=False)
img_512.save("public/icons/icon-512.png", "PNG", optimize=True)

# 2. 512x512 Maskable Icon for Android
img_maskable = create_archive_icon(512, is_maskable=True)
img_maskable.save("public/icons/icon-maskable-512.png", "PNG", optimize=True)

# 3. 192x192 Standard Icon
img_192 = img_512.resize((192, 192), Image.Resampling.LANCZOS)
img_192.save("public/icons/icon-192.png", "PNG", optimize=True)

# 4. 180x180 Apple Touch Icon (opaque squircle background for iOS)
img_apple = create_archive_icon(180, is_maskable=False)
# Ensure no alpha for Apple touch icon (Apple guidelines)
apple_opaque = Image.new("RGB", (180, 180), (15, 23, 42))
apple_opaque.paste(img_apple, mask=img_apple.split()[3])
apple_opaque.save("public/icons/apple-touch-icon.png", "PNG", optimize=True)

# 5. Favicon 48x48
img_48 = img_512.resize((48, 48), Image.Resampling.LANCZOS)
img_48.save("public/icons/favicon-48.png", "PNG", optimize=True)

print("Icons successfully generated!")
