"""
Setup file for Custom Permissions System
ملف الإعداد لنظام الصلاحيات المخصصة
"""

from setuptools import setup, find_packages

setup(
    name="django-custom-permissions",
    version="1.0.0",
    description="Custom permissions system for Django LMS",
    long_description=open("README.md").read(),
    author="LMS Development Team",
    author_email="dev@lms.com",
    url="https://github.com/lms/custom-permissions",
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: Web Environment",
        "Framework :: Django",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    install_requires=[
        "Django>=4.0",
    ],
    python_requires=">=3.8",
) 