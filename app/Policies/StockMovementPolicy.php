<?php

namespace App\Policies;

use App\Models\StockMovement;
use App\Models\User;

class StockMovementPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, StockMovement $stockMovement): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, StockMovement $stockMovement): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, StockMovement $stockMovement): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, StockMovement $stockMovement): bool
    {
        return $user->isAdmin();
    }

    public function forceDelete(User $user, StockMovement $stockMovement): bool
    {
        return $user->isAdmin();
    }
}
