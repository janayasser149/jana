# Jana Yasser 
# 192300149
# G1-2

import cv2
from pathlib import Path

class ImageProcessor:
    def _init_(self, filename: str):
        self.filepath = Path(filename)
        self.img = None

    def load_image(self) -> bool:
        """Loads the image and checks if it exists."""
        if not self.filepath.exists():
            print(f"Error: File '{self.filepath}' does not exist.")
            return False
        
        self.img = cv2.imread(str(self.filepath))
        if self.img is None:
            print(f"Error: Could not read image '{self.filepath}'.")
            return False
            
        print("Original image shape:", self.img.shape)
        return True

    def run_pipeline(self):
        """Executes the complete image processing workflow."""
        if not self.load_image():
            return

        # 1. Display Original
        cv2.imshow("Original Image", self.img)

        # 2. Grayscale Conversion & Save
        gray = cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY)
        cv2.imwrite("lena_gray.png", gray)

        # 3. Rotate 90 Degrees Clockwise, Save & Display
        rotated = cv2.rotate(self.img, cv2.ROTATE_90_CLOCKWISE)
        cv2.imwrite("lena_rotated.jpg", rotated)
        cv2.imshow("Rotated Image", rotated)

        # 4. Resize by 50%, Save & Display
        resized = cv2.resize(self.img, (0, 0), fx=0.5, fy=0.5)
        cv2.imwrite("lena_resized.jpg", resized)
        cv2.imshow("Resized Image", resized)

        # Wait for key press and clean up windows
        cv2.waitKey(0)
        cv2.destroyAllWindows()

if _name_ == "_main_":
    processor = ImageProcessor("lena.jpg")
    processor.run_pipeline()