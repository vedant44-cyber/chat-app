#!/bin/bash

set -e # Exit on error

# Create local bin directory
mkdir -p ./node_modules/.bin

# Determine OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Set protoc version and platform
PROTOC_VERSION="21.12"

case "$OS" in
  darwin)
    case "$ARCH" in
      arm64)
        # For Apple Silicon (M1/M2)
        PROTOC_PLATFORM="osx-aarch_64"
        ;;
      x86_64)
        # For Intel Mac
        PROTOC_PLATFORM="osx-x86_64"
        ;;
    esac
    ;;
  linux)
    case "$ARCH" in
      aarch64|arm64)
        PROTOC_PLATFORM="linux-aarch_64"
        ;;
      x86_64)
        PROTOC_PLATFORM="linux-x86_64"
        ;;
    esac
    ;;
  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac

if [ -z "$PROTOC_PLATFORM" ]; then
    echo "Unsupported platform: $OS $ARCH"
    exit 1
fi

# Install protoc
PROTOC_ZIP="protoc-${PROTOC_VERSION}-${PROTOC_PLATFORM}.zip"
PROTOC_URL="https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/${PROTOC_ZIP}"

echo "Downloading protoc from: ${PROTOC_URL}"
curl -L -o "${PROTOC_ZIP}" "${PROTOC_URL}" || {
    echo "Failed to download protoc"
    exit 1
}

if [ ! -f "${PROTOC_ZIP}" ]; then
    echo "Failed to download protoc"
    exit 1
fi

# Extract protoc to the correct location
unzip -o "${PROTOC_ZIP}" -d protoc_temp
mv protoc_temp/bin/protoc ./node_modules/.bin/
mv protoc_temp/include ./node_modules/.bin/
rm -rf protoc_temp
rm -f "${PROTOC_ZIP}"

# Install required npm packages
echo "Installing required npm packages..."
npm install --save-dev protoc-gen-js
npm install --save-dev protoc-gen-grpc-web

# Create symlinks for the plugins
ln -sf $(npm bin)/protoc-gen-js ./node_modules/.bin/
ln -sf $(npm bin)/protoc-gen-grpc-web ./node_modules/.bin/

# Verify installations
echo "Verifying installations..."
chmod +x ./node_modules/.bin/protoc
export PATH="$PWD/node_modules/.bin:$PATH"

echo "Installation completed successfully"
echo "protoc version: $(./node_modules/.bin/protoc --version)"
echo "Installed plugins:"
ls -la ./node_modules/.bin/ 