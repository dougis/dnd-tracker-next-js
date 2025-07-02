#!/bin/bash
# Comprehensive authentication flow testing script

set -e

# Default to localhost if no URL provided
BASE_URL=${1:-"http://localhost:3000"}

echo "🧪 Testing Authentication Flows for: $BASE_URL"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
# YELLOW='\033[1;33m'  # Removed unused color variable
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" &>/dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Test HTTP response codes
test_http_status() {
    local endpoint="$1"
    local expected_status="$2"
    local description="$3"
    
    local actual_status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    
    if [ "$actual_status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $description (HTTP $actual_status)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - $description (Expected HTTP $expected_status, got $actual_status)"
        ((TESTS_FAILED++))
    fi
}

echo ""
echo "🔍 Testing Basic Endpoints..."

# Test health check
test_http_status "/api/health/db" 200 "Database health check"

# Test NextAuth endpoints
test_http_status "/api/auth/signin" 200 "NextAuth signin endpoint"
test_http_status "/api/auth/session" 200 "NextAuth session endpoint"
test_http_status "/api/auth/csrf" 200 "NextAuth CSRF token endpoint"

echo ""
echo "🔐 Testing Authentication Pages..."

# Test auth pages
test_http_status "/auth/signin" 200 "Sign in page"
test_http_status "/auth/signup" 200 "Sign up page"
test_http_status "/auth/error" 200 "Auth error page"
test_http_status "/auth/reset-password" 200 "Password reset page"

echo ""
echo "🚫 Testing Protected Routes (should require auth)..."

# Test protected pages (should redirect to signin)
test_http_status "/dashboard" 307 "Dashboard redirect when not authenticated"
test_http_status "/characters" 307 "Characters redirect when not authenticated"
test_http_status "/encounters" 307 "Encounters redirect when not authenticated"

echo ""
echo "🛡️ Testing Protected API Routes (should return 401)..."

# Test protected API routes
test_http_status "/api/users" 401 "Users API requires authentication"
test_http_status "/api/characters" 401 "Characters API requires authentication"
test_http_status "/api/encounters" 401 "Encounters API requires authentication"

echo ""
echo "📧 Testing User Registration Flow..."

# Generate unique test email
TIMESTAMP=$(date +%s)
TEST_EMAIL="test$TIMESTAMP@example.com"
TEST_PASSWORD="TestPassword123!"

# Test user registration
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\",
        \"firstName\": \"Test\",
        \"lastName\": \"User\"
    }")

REGISTER_HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | head -n -1)

if [ "$REGISTER_HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ PASS${NC} - User registration"
    ((TESTS_PASSED++))
    
    # Check if response contains success message
    if echo "$REGISTER_BODY" | grep -q "success"; then
        echo -e "${GREEN}✅ PASS${NC} - Registration returns success response"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - Registration response format"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}❌ FAIL${NC} - User registration (HTTP $REGISTER_HTTP_CODE)"
    echo "Response: $REGISTER_BODY"
    ((TESTS_FAILED++))
fi

echo ""
echo "🔑 Testing Sign In Flow..."

# Test sign in with credentials
SIGNIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/callback/credentials" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=$TEST_EMAIL&password=$TEST_PASSWORD")

SIGNIN_HTTP_CODE=$(echo "$SIGNIN_RESPONSE" | tail -n1)

if [ "$SIGNIN_HTTP_CODE" -eq 200 ] || [ "$SIGNIN_HTTP_CODE" -eq 302 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Credentials sign in"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - Credentials sign in (HTTP $SIGNIN_HTTP_CODE)"
    ((TESTS_FAILED++))
fi

echo ""
echo "⚠️ Testing Error Cases..."

# Test registration with invalid email
INVALID_EMAIL_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"invalid-email\",
        \"password\": \"TestPassword123!\",
        \"firstName\": \"Test\",
        \"lastName\": \"User\"
    }")

INVALID_EMAIL_HTTP_CODE=$(echo "$INVALID_EMAIL_RESPONSE" | tail -n1)

if [ "$INVALID_EMAIL_HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Invalid email validation"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - Invalid email validation (HTTP $INVALID_EMAIL_HTTP_CODE)"
    ((TESTS_FAILED++))
fi

# Test registration with weak password
WEAK_PASSWORD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"test2$TIMESTAMP@example.com\",
        \"password\": \"123\",
        \"firstName\": \"Test\",
        \"lastName\": \"User\"
    }")

WEAK_PASSWORD_HTTP_CODE=$(echo "$WEAK_PASSWORD_RESPONSE" | tail -n1)

if [ "$WEAK_PASSWORD_HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Weak password validation"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - Weak password validation (HTTP $WEAK_PASSWORD_HTTP_CODE)"
    ((TESTS_FAILED++))
fi

# Test duplicate registration
DUPLICATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"TestPassword123!\",
        \"firstName\": \"Test\",
        \"lastName\": \"User\"
    }")

DUPLICATE_HTTP_CODE=$(echo "$DUPLICATE_RESPONSE" | tail -n1)

if [ "$DUPLICATE_HTTP_CODE" -eq 409 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Duplicate email validation"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - Duplicate email validation (HTTP $DUPLICATE_HTTP_CODE)"
    ((TESTS_FAILED++))
fi

echo ""
echo "📊 Test Results Summary"
echo "======================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Authentication system is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the configuration and logs.${NC}"
    
    echo ""
    echo "🔧 Troubleshooting Tips:"
    echo "1. Ensure MongoDB is connected and accessible"
    echo "2. Verify NEXTAUTH_SECRET is set correctly"
    echo "3. Check that all environment variables are configured"
    echo "4. Review application logs for detailed error messages"
    echo "5. Test database connectivity: curl $BASE_URL/api/health/db"
    
    exit 1
fi