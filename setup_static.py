import os
import shutil
import sys

def setup_static_files():
    """
    Set up static files for the Flask application.
    This script creates necessary directories and copies static files to the appropriate locations.
    """
    print("Setting up static files for the application...")
    
    # Define directories
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    icons_dir = os.path.join(static_dir, 'icons')
    
    # Create directories if they don't exist
    os.makedirs(static_dir, exist_ok=True)
    os.makedirs(icons_dir, exist_ok=True)
    
    # Check if icon.svg exists
    icon_svg_path = os.path.join(icons_dir, 'icon.svg')
    if not os.path.exists(icon_svg_path):
        print(f"Warning: {icon_svg_path} does not exist. Please create this file.")
    
    # Create favicon.ico directly
    try:
        from PIL import Image, ImageDraw
        
        # Create a new image with a blue background for favicon
        favicon_size = 32
        favicon_img = Image.new('RGB', (favicon_size, favicon_size), color=(41, 128, 185))
        draw = ImageDraw.Draw(favicon_img)
        
        # Add some simple graphics (a sleep icon - moon and stars)
        # Draw a moon
        padding = favicon_size // 8
        moon_size = favicon_size - (padding * 2)
        draw.ellipse(
            [(padding, padding), (padding + moon_size, padding + moon_size)], 
            fill=(52, 152, 219)
        )
        
        # Draw a smaller circle to create crescent moon effect
        offset = favicon_size // 5
        smaller_size = moon_size - offset
        draw.ellipse(
            [(padding + offset, padding), (padding + offset + smaller_size, padding + smaller_size)], 
            fill=(41, 128, 185)
        )
        
        # Draw a star
        star_size = favicon_size // 10
        star_pos = (favicon_size // 4, favicon_size // 3)
        x, y = star_pos
        draw.ellipse(
            [(x - star_size//2, y - star_size//2), (x + star_size//2, y + star_size//2)], 
            fill=(255, 255, 255)
        )
        
        # Save the favicon
        favicon_path = os.path.join(os.path.dirname(__file__), 'favicon.ico')
        favicon_img.save(favicon_path, format='ICO')
        print(f"Created favicon at {favicon_path}")
    except ImportError:
        print("Pillow library not found. Cannot create favicon.")
        print("To install Pillow: pip install Pillow")
    except Exception as e:
        print(f"Error creating favicon: {str(e)}")
    
    # Create a simple placeholder icon if needed
    icon_sizes = [192, 512]
    for size in icon_sizes:
        icon_path = os.path.join(icons_dir, f'icon-{size}x{size}.png')
        if not os.path.exists(icon_path):
            print(f"Creating placeholder {icon_path}...")
            try:
                # Try to create a simple colored square icon using Pillow
                try:
                    from PIL import Image, ImageDraw
                    
                    # Create a new image with a blue background
                    img = Image.new('RGB', (size, size), color=(41, 128, 185))
                    draw = ImageDraw.Draw(img)
                    
                    # Add some simple graphics (a sleep icon - moon and stars)
                    # Draw a moon
                    padding = size // 8
                    moon_size = size - (padding * 2)
                    draw.ellipse(
                        [(padding, padding), (padding + moon_size, padding + moon_size)], 
                        fill=(52, 152, 219)
                    )
                    
                    # Draw a smaller circle to create crescent moon effect
                    offset = size // 5
                    smaller_size = moon_size - offset
                    draw.ellipse(
                        [(padding + offset, padding), (padding + offset + smaller_size, padding + smaller_size)], 
                        fill=(41, 128, 185)
                    )
                    
                    # Draw stars
                    star_size = size // 20
                    star_positions = [
                        (size // 4, size // 3),
                        (size // 3 * 2, size // 4),
                        (size // 5 * 4, size // 2)
                    ]
                    
                    for pos in star_positions:
                        x, y = pos
                        draw.ellipse(
                            [(x - star_size//2, y - star_size//2), (x + star_size//2, y + star_size//2)], 
                            fill=(255, 255, 255)
                        )
                    
                    # Save the image
                    img.save(icon_path)
                    print(f"Created placeholder icon at {icon_path}")
                except ImportError:
                    print("Pillow library not found. Cannot create placeholder icon.")
                    print(f"Please manually create {icon_path} ({size}x{size} pixels).")
                    print("To install Pillow: pip install Pillow")
            except Exception as e:
                print(f"Error creating icon: {str(e)}")
                print(f"Please manually create {icon_path} ({size}x{size} pixels).")
    
    print("Static file setup complete.")
    print("Note: If you need to create custom icons, install Pillow:")
    print("pip install Pillow")

if __name__ == "__main__":
    setup_static_files()