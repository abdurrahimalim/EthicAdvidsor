<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users',
            'password'      => 'required|min:8|confirmed',
            'user_type'     => 'required|in:auditor,perusahaan_fintech',
            'company_name'  => 'nullable|string',
            'company_type'  => 'nullable|string',
            'location'      => 'nullable|string',
        ]);

        $user = User::create([
            'name'         => $request->name,
            'email'        => $request->email,
            'password'     => Hash::make($request->password),
            'role'         => 'user',
            'user_type'    => $request->user_type,
            'company_name' => $request->company_name,
            'company_type' => $request->company_type,
            'location'     => $request->location,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Register berhasil',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email atau password salah'
            ], 401);
        }

        $user  = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|unique:users,email,' . $request->user()->id,
            'company_name' => 'nullable|string',
            'company_type' => 'nullable|string',
            'location'     => 'nullable|string',
        ]);
    
        $user = $request->user();
        $user->update([
            'name'         => $request->name,
            'email'        => $request->email,
            'company_name' => $request->company_name,
            'company_type' => $request->company_type,
            'location'     => $request->location,
        ]);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user'    => $user->fresh(),
        ]);
    }


    public function deleteAccount(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $user->delete();

        return response()->json(['message' => 'Akun berhasil dihapus']);
    }
}