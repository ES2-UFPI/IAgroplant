import cloudinary
import cloudinary.uploader
from decouple import config

cloudinary.config(
    cloud_name=config("CLOUDINARY_CLOUD_NAME", default=""),
    api_key=config("CLOUDINARY_API_KEY", default=""),
    api_secret=config("CLOUDINARY_API_SECRET", default=""),
    secure=True,
)


class CloudinaryStorageService:
    """
    Serviço de armazenamento de imagens. Nunca é acessado diretamente pelos
    domains — é injetado nos use cases que precisam dele (ex.:
    UpdateProfilePhotoUseCase), seguindo a convenção de integrations/.
    """

    def upload_image(self, file, public_id: str, folder: str = "profile-photos") -> str:
        result = cloudinary.uploader.upload(
            file,
            public_id=public_id,
            folder=folder,
            overwrite=True,
        )
        return result["secure_url"]
