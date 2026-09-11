<?php

namespace App\Http\Controllers;

use App\Http\Requests\AuditRequest;
use App\Models\AuditLog;
use Inertia\Inertia;
use Inertia\Response;

class AuditController extends Controller
{
    public function index(AuditRequest $request): Response
    {
        $query = AuditLog::with('user');

        if ($userId = $request->input('user_id')) {
            $query->forUser($userId);
        }

        if ($auditableType = $request->input('auditable_type')) {
            $query->forModel($auditableType);
        }

        if ($event = $request->input('event')) {
            $query->forEvent($event);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->where('created_at', '<=', $dateTo.' 23:59:59');
        }

        $perPage = max(1, min(100, $request->integer('per_page', 25)));
        $logs = $query->latest('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('audit/index', [
            'logs' => $logs,
            'filters' => $request->only(['user_id', 'auditable_type', 'event', 'date_from', 'date_to', 'per_page']),
        ]);
    }

    public function show(AuditLog $auditLog): Response
    {
        $auditLog->load('user');

        return Inertia::render('audit/show', [
            'log' => $auditLog,
        ]);
    }
}
