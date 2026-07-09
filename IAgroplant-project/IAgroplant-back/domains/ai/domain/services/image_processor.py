import base64
import io

from PIL import Image


class ImageProcessor:

    MAX_SIZE = (1024, 1024)

    JPEG_QUALITY = 85


    @staticmethod
    def process(image_bytes: bytes):

        image_stream = io.BytesIO(
            image_bytes
        )

        image = Image.open(
            image_stream
        )


        image.thumbnail(
            ImageProcessor.MAX_SIZE
        )


        if image.mode != "RGB":

            image = image.convert(
                "RGB"
            )


        buffer = io.BytesIO()


        image.save(
            buffer,
            format="JPEG",
            quality=ImageProcessor.JPEG_QUALITY,
            optimize=True
        )


        encoded = base64.b64encode(
            buffer.getvalue()
        ).decode("utf-8")


        # Retorna somente Base64
        # A Kindwise não aceita data:image/jpeg;base64,
        return encoded