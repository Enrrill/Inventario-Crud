<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user() || ! $request->user()->role) {
            abort(403);
        }

        $userRole = $request->user()->role->value;

        if (! in_array($userRole, $roles)) {
            abort(403);
        }

        return $next($request);
    }
}
