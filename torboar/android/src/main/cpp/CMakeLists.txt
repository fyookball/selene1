cmake_minimum_required(VERSION 3.4.1)

# Set secp256k1 source dir
set(SECP256K1_DIR ${CMAKE_CURRENT_SOURCE_DIR}/secp256k1)

# Include secp headers
include_directories(${SECP256K1_DIR}/include)
include_directories(${SECP256K1_DIR}/src)

# Define the native library
add_library(secp256k1 SHARED
    secp256k1/secp256k1_jni.cpp
    ${SECP256K1_DIR}/src/secp256k1.c
    ${SECP256K1_DIR}/src/precomputed_ecmult.c
    ${SECP256K1_DIR}/src/precomputed_ecmult_gen.c
)

# Link against Android log lib (for logging)
find_library(log-lib log)
target_link_libraries(secp256k1 ${log-lib})

