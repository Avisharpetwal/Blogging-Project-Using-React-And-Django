from django.db.models import Sum
from rest_framework import status
from django.db.models import Count
from django.db.models.functions import TruncDate, TruncMonth
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.db.models.functions import TruncDay, TruncMonth
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import DatabaseError, OperationalError
from django.db.models import Q, Sum
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .models import User, Category, Blog, Comment
from .serializers import (UserSerializer, CategorySerializer, BlogSerializer, CommentSerializer,
                          RegisterSerializer, MyTokenObtainPairSerializer,
                          PasswordResetSerializer, PasswordResetConfirmSerializer)


# -------------------- AUTH --------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)
        except (DatabaseError, OperationalError):
            return Response({"detail": "Database error"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------------------- LOGIN --------------------
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except (DatabaseError, OperationalError):
            return Response({"detail": "Database connection error. Please try again later."},
                            status=status.HTTP_503_SERVICE_UNAVAILABLE)

# -------------------- LOGOUT--------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response({"detail": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Logged out successfully."}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    
    
    

# -------------------- USER INFO --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)





# -------------------- UPDATE PROFILE PICTURE--------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile_picture(request):
    user = request.user

    if 'profile_picture' in request.FILES:
        user.profile_picture = request.FILES['profile_picture']
        user.save()
        return Response({
            "profile_picture": user.profile_picture.url
        })
    return Response({"detail": "No image uploaded"}, status=400)




# -------------------- CATEGORY--------------------
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  
def category_list_create(request):
    if request.method == 'GET':
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    if not request.user.is_authenticated or not request.user.is_admin:
        return Response({"detail": "Only admin can create categories"}, status=status.HTTP_403_FORBIDDEN)

    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def category_detail(request, pk):
    try:
        category = Category.objects.get(pk=pk)
    except Category.DoesNotExist:
        return Response({"detail": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

    if not request.user.is_admin:
        return Response({"detail": "Only admin can modify categories"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'PUT':
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    
    
    
# -------------------- BLOG --------------------
@api_view(['GET', 'POST'])
@parser_classes([JSONParser, MultiPartParser, FormParser])
@permission_classes([AllowAny]) 
def blog_list_create(request):
    if request.method == 'GET':
        blogs = Blog.objects.filter(is_published=True)

        category_id = request.GET.get('category')
        if category_id:
            blogs = blogs.filter(category_id=category_id)

        search_query = request.GET.get('search')
        if search_query:
            blogs = blogs.filter(Q(title__icontains=search_query) | Q(content__icontains=search_query))

        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data)

    
    if not request.user.is_authenticated:
        return Response({"detail": "Authentication required to create blog"}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = BlogSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def blog_detail(request, pk):
    try:
        blog = Blog.objects.get(pk=pk)
    except Blog.DoesNotExist:
        return Response({"detail": "Blog not found"}, status=404)

    #  GET request (View blog)
    if request.method == 'GET':
        # Allow author/admin to see unpublished blogs
        if not blog.is_published and request.user != blog.author and not getattr(request.user, "is_admin", False):
            return Response({"detail": "You are not authorized to view this unpublished blog."}, status=403)
        blog.views += 1
        blog.save(update_fields=['views'])
        serializer = BlogSerializer(blog)
        return Response(serializer.data)

    #  Only author/admin can edit/delete
    if not (request.user == blog.author or getattr(request.user, "is_admin", False)):
        return Response({"detail": "You are not authorized to edit or delete this blog."}, status=403)

    if request.method == 'PUT':
        serializer = BlogSerializer(blog, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == 'DELETE':
        blog.delete()
        return Response(status=204)
    
    
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_blogs(request):
    user = request.user
    blogs = Blog.objects.filter(author=user)  
    serializer = BlogSerializer(blogs, many=True)
    return Response(serializer.data)




# -------------------- BLOG BY TITLE --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def blog_detail_by_title(request, title):
    try:
        blog = Blog.objects.get(title=title, is_published=True)
    except Blog.DoesNotExist:
        return Response({"detail": "Blog not found or not published"}, status=status.HTTP_404_NOT_FOUND)
    blog.views += 1
    blog.save(update_fields=['views'])
    serializer = BlogSerializer(blog)
    return Response(serializer.data)


# -------------------- LIKE TOGGLE --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like_blog(request, pk):
    try:
        blog = Blog.objects.get(pk=pk, is_published=True)
    except Blog.DoesNotExist:
        return Response({"detail": "Blog not found or not published"}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if user == blog.author:
        return Response({"detail": "You cannot like your own blog."}, status=status.HTTP_400_BAD_REQUEST)

    if user in blog.likes.all():
        blog.likes.remove(user)
        liked = False
    else:
        blog.likes.add(user)
        liked = True

    return Response({"liked": liked, "total_likes": blog.likes.count()})


# -------------------- COMMENTS --------------------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def comment_list_create(request, blog_id):
    try:
        blog = Blog.objects.get(pk=blog_id)
    except Blog.DoesNotExist:
        return Response({"detail": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        comments = Comment.objects.filter(blog=blog, deleted_at__isnull=True)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    serializer = CommentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(blog=blog, author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------------------- COMMENT --------------------
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, pk):
    try:
        comment = Comment.objects.get(pk=pk)
    except Comment.DoesNotExist:
        return Response({"detail": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)

    if not request.user.is_admin and comment.author != request.user:
        return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

    comment.soft_delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# -------------------- PASSWORD RESET --------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    serializer = PasswordResetSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data['email']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        
        return Response({"detail": "If email exists, a reset link will be sent."}, status=status.HTTP_200_OK)

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_link = f"http://localhost:3000/reset-password/{uid}/{token}"

    send_mail(
        subject="Password Reset",
        message=f"Click this link to reset your password: {reset_link}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
    )
    return Response({"detail": "If email exists, a reset link will be sent."}, status=status.HTTP_200_OK)

# -------------------- PASSWORD CHANGE --------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request, uidb64, token):
    serializer = PasswordResetConfirmSerializer(data={**request.data, "uid": uidb64, "token": token})
    serializer.is_valid(raise_exception=True)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({"detail": "Invalid reset link."}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(serializer.validated_data['new_password'])
    user.save()
    return Response({"detail": "Password has been reset successfully."}, status=status.HTTP_200_OK)


# # -------------------- STATS --------------------
@api_view(['GET'])
@permission_classes([IsAdminUser])
def stats(request):
    total_blogs = Blog.objects.count()
    total_likes = sum(blog.likes.count() for blog in Blog.objects.all())
    total_comments = Comment.objects.count()
    categories = list(Category.objects.values('id', 'name'))
    users = list(User.objects.values('id', 'username', 'email', 'is_admin'))
    blogs = list(Blog.objects.values('id', 'title', 'author_id', 'created_at'))

    # ---- Daily Blogs ----
    daily_blogs = (
        Blog.objects.annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(count=Count('id'))
        .order_by('date')
    )

    # ---- Monthly Blogs ----
    monthly_blogs = (
        Blog.objects.annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )

    # ---- Daily Users ----
    daily_users = (
        User.objects.annotate(date=TruncDate('date_joined'))
        .values('date')
        .annotate(count=Count('id'))
        .order_by('date')
    )

    # ---- Monthly Users ----
    monthly_users = (
        User.objects.annotate(month=TruncMonth('date_joined'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )

    return Response({
        'total_blogs': total_blogs,
        'total_likes': total_likes,
        'total_comments': total_comments,
        'total_categories': len(categories),
        'categories': categories,
        'blogs': blogs,
        'users': users,
        'daily_blogs': daily_blogs,
        'monthly_blogs': monthly_blogs,
        'daily_users': daily_users,
        'monthly_users': monthly_users,
    })
