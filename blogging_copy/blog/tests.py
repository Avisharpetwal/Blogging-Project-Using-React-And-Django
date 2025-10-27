from django.test import TestCase
from django.db import IntegrityError
from django.utils import timezone
from .models import User, Category, Blog, Comment

class UserModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="password123"
        )

    def test_user_creation(self):
        self.assertEqual(self.user.username, "testuser")
        self.assertFalse(self.user.is_admin)

    def test_user_str_method(self):
        self.assertEqual(str(self.user), "testuser")

    def test_unique_email_try_except(self):
        User.objects.create_user(
            username="user1",
            email="unique@example.com",
            password="password123"
        )

        try:
            User.objects.create_user(
                username="user2",
                email="unique@example.com",
                password="password123"
            )
            duplicate_created = True
        except IntegrityError:
            duplicate_created = False

        self.assertFalse(duplicate_created)


class CategoryModelTest(TestCase):

    def setUp(self):
        self.category = Category.objects.create(
            name="Education",
            description="All about education"
        )

    def test_category_creation(self):
        self.assertEqual(self.category.name, "Education")

    def test_category_str_method(self):
        self.assertEqual(str(self.category), "Education")

    def test_unique_name_try_except(self):
        Category.objects.create(name="Health")

        try:
            Category.objects.create(name="Health")
            duplicate_created = True
        except IntegrityError:
            duplicate_created = False

        self.assertFalse(duplicate_created)


class BlogModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="author", email="author@example.com", password="password123")
        self.category = Category.objects.create(name="Tech")
        self.blog = Blog.objects.create(
            title="My First Blog",
            content="This is blog content",
            author=self.user,
            category=self.category
        )

    def test_blog_creation(self):
        self.assertEqual(self.blog.title, "My First Blog")
        self.assertFalse(self.blog.is_published)
        self.assertEqual(self.blog.likes_count, 0)

    def test_blog_str_method(self):
        self.assertEqual(str(self.blog), "My First Blog")

    def test_publish_logic(self):
        future_time = timezone.now() + timezone.timedelta(days=1)
        blog = Blog.objects.create(
            title="Future Blog",
            content="Future content",
            author=self.user,
            category=self.category,
            publish_at=future_time
        )
        self.assertFalse(blog.is_published)

        past_time = timezone.now() - timezone.timedelta(days=1)
        blog2 = Blog.objects.create(
            title="Past Blog",
            content="Past content",
            author=self.user,
            category=self.category,
            publish_at=past_time
        )
        self.assertTrue(blog2.is_published)

    def test_blog_likes_count(self):
        another_user = User.objects.create_user(username="user2", email="user2@example.com", password="pass123")
        self.blog.likes.add(another_user)
        self.assertEqual(self.blog.likes_count, 1)


class CommentModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="commenter", email="comment@example.com", password="password123")
        self.category = Category.objects.create(name="Lifestyle")
        self.blog = Blog.objects.create(title="Blog for Comment", content="Content", author=self.user, category=self.category)
        self.comment = Comment.objects.create(blog=self.blog, author=self.user, content="Great post!")

    def test_comment_creation(self):
        self.assertEqual(self.comment.content, "Great post!")
        self.assertIsNone(self.comment.deleted_at)

    def test_comment_str_method(self):
        expected_str = f"{self.user.username} on '{self.blog.title}': {self.comment.content[:50]}"
        self.assertEqual(str(self.comment), expected_str)

    def test_soft_delete(self):
        self.comment.soft_delete()
        self.assertIsNotNone(self.comment.deleted_at)


from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from .models import User, Category, Blog, Comment
from .serializers import (
    MyTokenObtainPairSerializer,UserSerializer, CategorySerializer, BlogSerializer, CommentSerializer,
    RegisterSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer
)


User = get_user_model()

class UserSerializerTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="password123"
        )
        self.serializer = UserSerializer(instance=self.user)

    def test_serialized_data(self):
        data = self.serializer.data
        self.assertEqual(data['username'], "testuser")
        self.assertEqual(data['email'], "test@example.com")
        self.assertFalse(data['is_admin'])


class CategorySerializerTest(TestCase):

    def setUp(self):
        self.category = Category.objects.create(name="Tech", description="Technology")
        self.serializer = CategorySerializer(instance=self.category)

    def test_serialized_data(self):
        data = self.serializer.data
        self.assertEqual(data['name'], "Tech")
        self.assertEqual(data['description'], "Technology")


class BlogSerializerTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="author", email="author@example.com", password="pass123")
        self.category = Category.objects.create(name="Lifestyle")
        self.blog = Blog.objects.create(title="Test Blog", content="Content", author=self.user, category=self.category)
        self.serializer = BlogSerializer(instance=self.blog)

    def test_blog_serialized_fields(self):
        data = self.serializer.data
        self.assertEqual(data['title'], "Test Blog")
        self.assertEqual(data['author']['username'], "author")
        self.assertEqual(data['category']['name'], "Lifestyle")
        self.assertEqual(data['likes_count'], 0)

    def test_blog_create_with_category_name(self):
        data = {
            'title': "New Blog",
            'content': "New content",
            'author': self.user.id,
            'category_name': "Lifestyle"
        }
        serializer = BlogSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        blog = serializer.save(author=self.user)
        self.assertEqual(blog.category.name, "Lifestyle")
        self.assertEqual(blog.title, "New Blog")

    def test_blog_create_invalid_category(self):
        data = {
            'title': "Invalid Blog",
            'content': "Content",
            'author': self.user.id,
            'category_name': "NonExistent"
        }
        serializer = BlogSerializer(data=data)
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)


class CommentSerializerTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="commenter", email="comment@example.com", password="pass123")
        self.category = Category.objects.create(name="Food")
        self.blog = Blog.objects.create(title="Food Blog", content="Yummy", author=self.user, category=self.category)
        self.comment = Comment.objects.create(blog=self.blog, author=self.user, content="Nice post!")
        self.serializer = CommentSerializer(instance=self.comment)

    def test_comment_serialized_data(self):
        data = self.serializer.data
        self.assertEqual(data['comment'], "Nice post!")
        self.assertEqual(data['author']['username'], "commenter")


class RegisterSerializerTest(TestCase):

    def test_register_serializer_valid_data(self):
        data = {
            'username': "newuser",
            'email': "newuser@example.com",
            'password': "Password123!",
            'password2': "Password123!"
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.username, "newuser")
        self.assertEqual(user.email, "newuser@example.com")

    def test_register_serializer_password_mismatch(self):
        data = {
            'username': "newuser",
            'email': "newuser@example.com",
            'password': "Password123!",
            'password2': "WrongPassword!"
        }
        serializer = RegisterSerializer(data=data)
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)


class PasswordResetSerializerTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="user1", email="user1@example.com", password="pass123")

    def test_valid_email(self):
        serializer = PasswordResetSerializer(data={'email': 'user1@example.com'})
        self.assertTrue(serializer.is_valid())

    def test_invalid_email(self):
        serializer = PasswordResetSerializer(data={'email': 'nonexist@example.com'})
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)


class PasswordResetConfirmSerializerTest(TestCase):

    def test_password_validation(self):
        data = {
            'uid': 'someuid',
            'token': 'sometoken',
            'new_password': 'Password123!'
        }
        serializer = PasswordResetConfirmSerializer(data=data)
        self.assertTrue(serializer.is_valid())


class MyTokenObtainPairSerializerTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="jwtuser", email="jwt@example.com", password="pass123")

    def test_token_contains_custom_fields(self):
        token = MyTokenObtainPairSerializer.get_token(self.user)
        self.assertEqual(token['username'], "jwtuser")
        self.assertEqual(token['email'], "jwt@example.com")
        self.assertFalse(token['is_admin'])



from rest_framework import status
from rest_framework.test import APITestCase
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from blog.models import User, Category, Blog, Comment

class ViewsTestCase(APITestCase):

    def setUp(self):
        # Users
        self.user = User.objects.create_user(username="user1", email="user1@example.com", password="pass123")
        self.other_user = User.objects.create_user(username="user2", email="user2@example.com", password="pass123")
        self.admin = User.objects.create_user(username="admin", email="admin@example.com", password="admin123", is_admin=True)

        # Category
        self.category = Category.objects.create(name="Tech")

        # Blog
        self.blog = Blog.objects.create(
            title="Test Blog",
            content="Some content",
            author=self.user,
            category=self.category,
            is_published=True
        )

        # Comment
        self.comment = Comment.objects.create(blog=self.blog, author=self.user, content="Nice post!")

    # ----------------- AUTH -----------------
    def test_register(self):
        url = '/api/auth/register/'
        data = {'username': 'newuser', 'email': 'newuser@example.com', 'password': 'Pass123!', 'password2': 'Pass123!'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_login(self):
        url = '/api/auth/login/'
        data = {'username': 'user1', 'password': 'pass123'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_me(self):
        self.client.force_authenticate(user=self.user)
        url = '/api/auth/me/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)

    # ----------------- CATEGORY -----------------
    def test_category_list(self):
        self.client.force_authenticate(user=self.user)
        url = '/api/categories/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_category_admin(self):
        self.client.force_authenticate(user=self.admin)
        url = '/api/categories/'
        response = self.client.post(url, {'name': 'Lifestyle'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_category_non_admin(self):
        self.client.force_authenticate(user=self.user)
        url = '/api/categories/'
        response = self.client.post(url, {'name': 'Lifestyle'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ----------------- BLOG -----------------
    def test_blog_list(self):
        self.client.force_authenticate(user=self.user)
        url = '/api/blogs/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_blog(self):
        self.client.force_authenticate(user=self.user)
        url = '/api/blogs/'
        data = {'title': 'New Blog', 'content': 'New content', 'category_name': 'Tech'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_blog_detail_get(self):
        self.client.force_authenticate(user=self.user)
        url = f'/api/blogs/{self.blog.id}/'
        old_views = self.blog.views
        response = self.client.get(url)
        self.blog.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.blog.views, old_views + 1)

    def test_blog_update_by_author(self):
        self.client.force_authenticate(user=self.user)
        url = f'/api/blogs/{self.blog.id}/'
        data = {'title': 'Updated Blog'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.blog.refresh_from_db()
        self.assertEqual(self.blog.title, 'Updated Blog')

    def test_blog_update_by_non_author(self):
        self.client.force_authenticate(user=self.other_user)
        url = f'/api/blogs/{self.blog.id}/'
        data = {'title': 'Hacked Blog'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_toggle_like_blog(self):
        self.client.force_authenticate(user=self.other_user)
        url = f'/api/blogs/{self.blog.id}/like-toggle/'
        response = self.client.post(url)
        self.assertTrue(response.data['liked'])
        response = self.client.post(url)
        self.assertFalse(response.data['liked'])

    # ----------------- COMMENT -----------------
    def test_list_comments(self):
        self.client.force_authenticate(user=self.user)
        url = f'/api/blogs/{self.blog.id}/comments/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_comment(self):
        self.client.force_authenticate(user=self.user)
        url = f'/api/blogs/{self.blog.id}/comments/'
        data = {'comment': 'Another comment'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_delete_comment_by_author(self):
        self.client.force_authenticate(user=self.user)
        url = f'/api/comments/{self.comment.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_comment_by_non_author(self):
        self.client.force_authenticate(user=self.other_user)
        url = f'/api/comments/{self.comment.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ----------------- PASSWORD RESET -----------------
    def test_password_reset_request(self):
        url = '/api/auth/reset-password/'
        response = self.client.post(url, {'email': 'user1@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_password_reset_confirm(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        url = f'/api/auth/reset-password-confirm/{uid}/{token}/'
        response = self.client.post(url, {'new_password': 'Newpass123!'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('Newpass123!'))

    # ----------------- STATS -----------------
    def test_stats_admin(self):
        self.client.force_authenticate(user=self.admin)
        url = '/api/stats/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_blogs', response.data)
        self.assertIn('total_likes', response.data)
        self.assertIn('total_comments', response.data)

