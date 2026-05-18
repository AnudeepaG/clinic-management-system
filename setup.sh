#!/usr/bin/env bash
# ================================================================
# setup.sh — Full setup for ClinicOS (backend + frontend)
# Run from the clinic-app/ root directory
# ================================================================
set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     ClinicOS — Setup Script              ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. Check prerequisites ────────────────────────────────────────
check_cmd() {
  command -v "$1" &>/dev/null || { echo "❌  $1 is required but not installed."; exit 1; }
}
check_cmd java
check_cmd mvn
check_cmd node
check_cmd npm
check_cmd mysql

JAVA_VER=$(java -version 2>&1 | head -1 | sed 's/.*version "\([0-9]*\).*/\1/')
if [ "$JAVA_VER" -lt 17 ]; then
  echo "❌  Java 17+ is required (found Java $JAVA_VER)"; exit 1
fi
echo "✅  Prerequisites OK (Java $JAVA_VER, $(mvn -q --version), Node $(node -v))"

# ── 2. MySQL database setup ──────────────────────────────────────
echo ""
echo "📦  Setting up MySQL database..."
read -rp "MySQL root password: " -s MYSQL_PASS
echo ""

mysql -u root -p"$MYSQL_PASS" < schema.sql && echo "✅  Database schema applied" \
  || { echo "❌  MySQL setup failed"; exit 1; }

# Update backend application.properties password
sed -i "s/spring.datasource.password=.*/spring.datasource.password=$MYSQL_PASS/" \
    backend/src/main/resources/application.properties
echo "✅  Database password set in application.properties"

# ── 3. Build backend ─────────────────────────────────────────────
echo ""
echo "🔨  Building Spring Boot backend..."
cd backend
mvn clean package -DskipTests -q && echo "✅  Backend built successfully"
cd ..

# ── 4. Install frontend dependencies ────────────────────────────
echo ""
echo "📦  Installing Angular dependencies..."
cd frontend
npm install --silent && echo "✅  Frontend dependencies installed"
cd ..

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  Setup complete! Run ./run.sh to start   ║"
echo "╚══════════════════════════════════════════╝"
