# Makefile for Custom Permissions System
# ملف Makefile لنظام الصلاحيات المخصصة

.PHONY: help install test clean build docs

help:
	@echo "Custom Permissions System - Available commands:"
	@echo "نظام الصلاحيات المخصصة - الأوامر المتاحة:"
	@echo ""
	@echo "  install    - Install the package"
	@echo "  test       - Run tests"
	@echo "  clean      - Clean build files"
	@echo "  build      - Build package"
	@echo "  docs       - Generate documentation"
	@echo "  migrate    - Run migrations"
	@echo "  shell      - Open Django shell"
	@echo "  runserver  - Run development server"

install:
	pip install -e .

test:
	python manage.py test custom_permissions

clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info/
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -delete

build: clean
	python setup.py sdist bdist_wheel

docs:
	@echo "Generating documentation..."
	@echo "إنشاء التوثيق..."

migrate:
	python manage.py makemigrations custom_permissions
	python manage.py migrate

shell:
	python manage.py shell

runserver:
	python manage.py runserver

create-superuser:
	python manage.py createsuperuser

create-permission-groups:
	@echo "Creating permission groups..."
	@echo "إنشاء مجموعات الصلاحيات..."
	python manage.py create_permission_groups --username teacher1 --role teacher
	python manage.py create_permission_groups --username content_manager --role content_manager
	python manage.py create_permission_groups --username financial_manager --role financial_manager

check:
	@echo "Running code checks..."
	@echo "تشغيل فحوصات الكود..."
	flake8 custom_permissions/
	python -m black --check custom_permissions/
	python -m isort --check-only custom_permissions/

format:
	@echo "Formatting code..."
	@echo "تنسيق الكود..."
	black custom_permissions/
	isort custom_permissions/

lint:
	@echo "Linting code..."
	@echo "فحص الكود..."
	flake8 custom_permissions/
	pylint custom_permissions/

coverage:
	@echo "Running tests with coverage..."
	@echo "تشغيل الاختبارات مع تغطية الكود..."
	coverage run --source=custom_permissions manage.py test custom_permissions
	coverage report
	coverage html

security:
	@echo "Running security checks..."
	@echo "تشغيل فحوصات الأمان..."
	bandit -r custom_permissions/
	safety check

all: clean install test build 