from rest_framework import serializers
from .models import User, Category, Blog, Comment
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import password_validation


# ------------------- User Serializer -------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'is_admin', 'profile_picture', 'email']
        read_only_fields = ['is_admin']


# ------------------- Category Serializer -------------------
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


# ------------------- Comment Serializer -------------------
class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comment = serializers.CharField(source='content') 

    class Meta:
        model = Comment
        fields = ['id', 'blog', 'author', 'comment', 'created_at', 'deleted_at']
        read_only_fields = ['blog', 'author', 'created_at', 'deleted_at']


# ------------------- Blog Serializer -------------------
class BlogSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_name = serializers.CharField(write_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    likes_count = serializers.SerializerMethodField()  

    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'content', 'author', 'category', 'category_name', 'image',
            'is_published', 'publish_at', 'created_at', 'deleted_at', 'updated_at',
            'likes_count', 'comments'
        ]
        read_only_fields = ['author', 'category', "created_at", "deleted_at", "updated_at", "likes_count"]

    def get_likes_count(self, obj):
        return obj.likes.count() 

    def validate_category_name(self, value):
        try:
            Category.objects.get(name=value)
        except Category.DoesNotExist:
            raise serializers.ValidationError("Category does not exist. Only admins can create new categories.")
        return value

    # ---------------- Create new blog ----------------
    def create(self, validated_data):
        category_name = validated_data.pop('category_name')
        category = Category.objects.get(name=category_name)
        blog = Blog.objects.create(category=category, **validated_data)
        return blog


    # ---------------- Update existing blog ----------------
    def update(self, instance, validated_data):
        category_name = validated_data.pop('category_name', None)
        if category_name:
            category = Category.objects.get(name=category_name)
            instance.category = category
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


# ------------------- Registration Serializer -------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'profile_picture']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user






class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    def validate(self, attrs):
        # Can be username OR email
        identifier = attrs.get("username") 
        password = attrs.get("password")
        # Try username-based authentication first
        user = authenticate(username=identifier, password=password)
        # If not found, try email
        if user is None:
            
            try:
                user_obj = User.objects.get(email=identifier)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if user is None:
            raise serializers.ValidationError({"detail": "Invalid username/email or password"})

     
        refresh = self.get_token(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['id'] = user.id
        token['username'] = user.username
        token['email'] = user.email
        token['is_admin'] = getattr(user, 'is_admin', False)
        return token

# ------------------- Password Reset Serializers -------------------
class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No account found with this email.")
        return value

# -------------------  New Password  Serializers -------------------
class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, required=True,
                                         validators=[password_validation.validate_password])
