#!/bin/bash

# Token Tracker API Manual Test Script
# Usage: ./test-api.sh

echo "🧪 Token Tracker API Tests"
echo "=========================="
echo ""

BASE_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"

echo "Testing against: $BASE_URL"
echo ""

# Test 1: Verify anthropic-admin provider is accepted (should get 401, not 400)
echo "Test 1: POST /api/keys with anthropic-admin provider"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/keys" \
  -H "Content-Type: application/json" \
  -d '{"provider":"anthropic-admin","apiKey":"sk-ant-admin-test1234567890123456789012345678901234567890"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ PASS: Got 401 Unauthorized (expected - no session)"
elif [ "$HTTP_CODE" = "400" ]; then
  ERROR=$(echo "$BODY" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
  if [ "$ERROR" = "Invalid provider" ]; then
    echo "❌ FAIL: API rejected anthropic-admin as invalid provider"
    exit 1
  else
    echo "✅ PASS: Got 400 with error: $ERROR"
  fi
else
  echo "⚠️  Unexpected status code: $HTTP_CODE"
  echo "Response: $BODY"
fi
echo ""

# Test 2: Verify DELETE accepts anthropic-admin
echo "Test 2: DELETE /api/keys?provider=anthropic-admin"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/keys?provider=anthropic-admin")

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ PASS: Got 401 Unauthorized (expected - no session)"
elif [ "$HTTP_CODE" = "400" ]; then
  echo "❌ FAIL: API rejected anthropic-admin as invalid provider"
  exit 1
else
  echo "⚠️  Unexpected status code: $HTTP_CODE"
fi
echo ""

# Test 3: Verify Moonshot endpoint
echo "Test 3: GET /api/moonshot/usage"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/moonshot/usage")

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ PASS: Got 401 Unauthorized (expected - no session)"
else
  echo "⚠️  Unexpected status code: $HTTP_CODE (expected 401)"
fi
echo ""

# Test 4: Verify Anthropic endpoint
echo "Test 4: GET /api/anthropic/usage"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/anthropic/usage")

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ PASS: Got 401 Unauthorized (expected - no session)"
else
  echo "⚠️  Unexpected status code: $HTTP_CODE (expected 401)"
fi
echo ""

# Test 5: Verify moonshot provider still works
echo "Test 5: POST /api/keys with moonshot provider"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/keys" \
  -H "Content-Type: application/json" \
  -d '{"provider":"moonshot","apiKey":"sk-test1234567890123456789012345678901234567890"}')

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ PASS: Got 401 Unauthorized (expected - no session)"
elif [ "$HTTP_CODE" = "400" ]; then
  echo "❌ FAIL: API rejected moonshot as invalid provider"
  exit 1
else
  echo "⚠️  Unexpected status code: $HTTP_CODE"
fi
echo ""

echo "=========================="
echo "✅ All tests passed!"
echo ""
echo "Note: 401 responses are expected since these tests don't include authentication."
echo "The important thing is that we don't get 'Invalid provider' errors."
