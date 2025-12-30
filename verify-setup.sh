#!/bin/bash

echo "======================================"
echo "Flaco Admin Dashboard Setup Verifier"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check .env file
echo "Checking .env file..."
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check for required vars
    if grep -q "PUBLIC_SUPABASE_URL" .env; then
        echo -e "${GREEN}✓${NC} PUBLIC_SUPABASE_URL found"
    else
        echo -e "${RED}✗${NC} PUBLIC_SUPABASE_URL missing"
    fi
    
    if grep -q "PUBLIC_SUPABASE_ANON_KEY" .env; then
        echo -e "${GREEN}✓${NC} PUBLIC_SUPABASE_ANON_KEY found"
    else
        echo -e "${RED}✗${NC} PUBLIC_SUPABASE_ANON_KEY missing"
    fi
else
    echo -e "${RED}✗${NC} .env file not found"
fi
echo ""

# Check SQL scripts
echo "Checking SQL scripts..."
if [ -f supabase/database-schema.sql ]; then
    echo -e "${GREEN}✓${NC} database-schema.sql exists"
else
    echo -e "${RED}✗${NC} database-schema.sql missing"
fi

if [ -f supabase/storage-policies.sql ]; then
    echo -e "${GREEN}✓${NC} storage-policies.sql exists"
else
    echo -e "${RED}✗${NC} storage-policies.sql missing"
fi
echo ""

# Check GitHub workflows
echo "Checking GitHub workflows..."
if [ -f .github/workflows/deploy.yml ]; then
    echo -e "${GREEN}✓${NC} deploy.yml exists"
else
    echo -e "${RED}✗${NC} deploy.yml missing"
fi

if [ -f .github/workflows/ci.yml ]; then
    echo -e "${GREEN}✓${NC} ci.yml exists"
else
    echo -e "${RED}✗${NC} ci.yml missing"
fi
echo ""

# Check admin files
echo "Checking admin components..."
ADMIN_FILES=(
    "src/pages/admin/login.astro"
    "src/pages/admin/index.astro"
    "src/pages/admin/analytics.astro"
    "src/pages/admin/posts.astro"
    "src/pages/admin/projects.astro"
    "src/pages/admin/media.astro"
    "src/components/admin/AuthProvider.tsx"
    "src/components/admin/AuthGuard.tsx"
    "src/components/admin/MediaUpload.tsx"
    "src/components/admin/MediaGallery.tsx"
    "src/layouts/AdminLayout.astro"
)

ALL_EXIST=true
for file in "${ADMIN_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file missing"
        ALL_EXIST=false
    fi
done
echo ""

# Check if dev server is running
echo "Checking dev server..."
if curl -s http://localhost:4322 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Dev server running at http://localhost:4322"
else
    echo -e "${YELLOW}⚠${NC} Dev server not running (run: npm run dev)"
fi
echo ""

echo "======================================"
echo "Next Steps:"
echo "======================================"
echo "1. Follow QUICK_SETUP.md for Supabase configuration"
echo "2. Test locally: http://localhost:4322/admin/login"
echo "3. Deploy to production when ready"
echo ""
