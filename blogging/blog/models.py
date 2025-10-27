from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.exceptions import ValidationError

# ------------------- Validators -------------------
def validate_image(image):
    max_size = 5 * 1024 * 1024  # 5MB
    if image.size > max_size:
        raise ValidationError("Image size should be <= 5MB")
    if not image.name.lower().endswith(('.jpg', '.jpeg', '.png')):
        raise ValidationError("Only .jpg, .jpeg, .png files are allowed.")


# ------------------- User Model -------------------
class User(AbstractUser):
    is_admin = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to="profile_pics/", blank=True, null=True, validators=[validate_image])
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username


# ------------------- Category Model -------------------
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


# ------------------- Blog Model -------------------
class Blog(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    image = models.ImageField(upload_to='blog_image/', blank=True, null=True, validators=[validate_image])
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blogs')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='blogs')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    publish_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    likes = models.ManyToManyField(User, related_name='liked_blogs', blank=True)
    views = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if self.publish_at and self.publish_at <= timezone.now():
            self.is_published = True
        super().save(*args, **kwargs)

    @property
    def likes_count(self):
        return self.likes.count()

    def __str__(self):
        return self.title



# ------------------- Comment Model -------------------
class Comment(models.Model):
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save()

    def __str__(self):
        return f"{self.author.username} on '{self.blog.title}': {self.content[:50]}"

