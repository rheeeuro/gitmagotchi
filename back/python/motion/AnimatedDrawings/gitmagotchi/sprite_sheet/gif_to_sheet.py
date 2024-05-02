import os
from PIL import Image
from tqdm import tqdm

def gif_to_sheet(char_anno_dir: str):
    file = os.path.join(char_anno_dir, "video.gif")
    if not os.path.exists(file):
        print("No gif")
        return

    gif = Image.open(file)
    print(f"Size: {gif.size}")
    print(f"Frames: {gif.n_frames}")
        
    OUTPUT_SIZE = gif.size # The output size of each frame (or tile or Sprite) of the animation
    output = Image.new("RGB", (OUTPUT_SIZE[0] * gif.n_frames, OUTPUT_SIZE[1]))
    output_filename = f"icon_{gif.n_frames}_frames.bmp"
    output_path = os.path.join(char_anno_dir, output_filename)

    print(f"Writing a sprite sheet to {output_path}")
    for frame in tqdm(range(0,gif.n_frames)):
        gif.seek(frame)
        extracted_frame = gif.resize(OUTPUT_SIZE)
        position = (OUTPUT_SIZE[0]*frame, 0)
        output.paste(extracted_frame, position)

    output.save(output_path)