# Use an official Ubuntu as a parent image
FROM ubuntu:20.04

# Set environment variables to non-interactive
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libtool \
    autotools-dev \
    automake \
    pkg-config \
    libssl-dev \
    git \
    wget \
    lua5.3 \
    liblua5.3-dev \
    luarocks \
    vim

# Install secp256k1 library
RUN git clone https://github.com/bitcoin-core/secp256k1.git && \
    cd secp256k1 && \
    ./autogen.sh && \
    ./configure --enable-module-recovery && \
    make && \
    make install && \
    ldconfig

# Create a directory for the Lua scripts and C module
WORKDIR /usr/src/app

# Copy the C code
#COPY secp256k1.c .

COPY . .

# Compile the C code into a shared library
RUN gcc -shared -fPIC -g -o secp256k1.so -I/usr/local/include -I/usr/include/lua5.3 \
        secp256k1.c /usr/local/lib/libsecp256k1.so.2 \
        -L/usr/lib/x86_64-linux-gnu -llua5.3

# Copy the Lua script
# COPY verify_signature.lua .


#RUN wget https://www.openssl.org/source/openssl-3.2.2.tar.gz
#RUN tar -xzvf openssl-3.2.2.tar.gz
#RUN cd openssl-3.2.2
#RUN ./config && make && make install

# Install luaossl for cryptographic operations
# RUN luarocks install luazen

#RUN git clone https://github.com/philanc/luazen.git
#RUN cd luazen
#RUN luarocks build luazen-0.16-1.rockspec

#RUN wget https://github.com/philanc/luazen/archive/refs/tags/v0.16.tar.gz
#RUN tar -xzvf v0.16.tar.gz
#RUN cd luazen-0.16 && \
#    luarocks make

# Run the Lua script
CMD ["lua5.3", "verify_signature.lua"]
