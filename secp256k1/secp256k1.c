#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
#include <secp256k1.h>
#include <secp256k1_recovery.h>
#include <string.h>

static int l_verify_signature(lua_State *L) {
    size_t msg_len, sig_len, pubkey_len;
    const char *msg = luaL_checklstring(L, 1, &msg_len);
    const char *sig = luaL_checklstring(L, 2, &sig_len);
    const char *pubkey = luaL_checklstring(L, 3, &pubkey_len);

    if (sig_len != 65) {
        luaL_error(L, "Invalid signature length");
        return 0;
    }

    secp256k1_context *ctx = secp256k1_context_create(SECP256K1_CONTEXT_VERIFY);
    secp256k1_ecdsa_recoverable_signature rec_sig;
    int v = sig[64] - 27;

    if (!secp256k1_ecdsa_recoverable_signature_parse_compact(ctx, &rec_sig, (unsigned char *)sig, v)) {
        secp256k1_context_destroy(ctx);
        lua_pushboolean(L, 0);
        return 1;
    }

    secp256k1_pubkey recovered_pubkey;
    if (!secp256k1_ecdsa_recover(ctx, &recovered_pubkey, &rec_sig, (unsigned char *)msg)) {
        secp256k1_context_destroy(ctx);
        lua_pushboolean(L, 0);
        return 1;
    }

    unsigned char output[65];
    size_t outputlen = 65;
    secp256k1_ec_pubkey_serialize(ctx, output, &outputlen, &recovered_pubkey, SECP256K1_EC_UNCOMPRESSED);

    secp256k1_context_destroy(ctx);

    lua_pushboolean(L, outputlen == pubkey_len && memcmp(output, pubkey, pubkey_len) == 0);
    return 1;
}

int luaopen_secp256k1(lua_State *L) {
    static const struct luaL_Reg secp256k1[] = {
        {"verify_signature", l_verify_signature},
        {NULL, NULL}
    };
    luaL_newlib(L, secp256k1);
    return 1;
}
