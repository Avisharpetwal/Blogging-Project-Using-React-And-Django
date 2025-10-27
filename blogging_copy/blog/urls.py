from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
urlpatterns = [
    # ---------------- AUTH ----------------
    path('auth/register/', views.register, name='auth-register'),
    path('auth/login/', views.MyTokenObtainPairView.as_view(), name='auth-login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/logout/', views.logout, name='auth-logout'),
    path('auth/me/', views.me, name='auth-me'),
    path('auth/me/update-profile-picture/', views.update_profile_picture),  

    # ------------- PASSWORD RESET -----------
    path('auth/reset-password/', views.password_reset_request, name='password-reset'),
    path('auth/reset-password-confirm/<uidb64>/<token>/', views.password_reset_confirm, name='password-reset-confirm'),

    # ------------- CATEGORY ----------------
    path('categories/', views.category_list_create, name='category-list-create'),
    path('categories/<int:pk>/', views.category_detail, name='category-detail'),

    # ------------- BLOG -------------------
    path('blogs/', views.blog_list_create, name='blog-list-create'),
    path('blogs/<int:pk>/', views.blog_detail, name='blog-detail'),
    path('blogs/my-blogs/', views.my_blogs, name='my_blogs'),
    path('blogs/title/<str:title>/', views.blog_detail_by_title, name='blog-detail-by-title'),
    path('blogs/<int:pk>/like-toggle/', views.toggle_like_blog, name='blog-like-toggle'),

    # ------------- COMMENT ----------------
    path('blogs/<int:blog_id>/comments/', views.comment_list_create, name='comment-list-create'),
    path('comments/<int:pk>/', views.delete_comment, name='comment-delete'),

    # ------------- STATS --------------------
    path('stats/', views.stats, name='admin-stats'),
]
