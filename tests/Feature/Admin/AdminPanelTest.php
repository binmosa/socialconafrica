<?php

namespace Tests\Feature\Admin;

use App\Models\AdminAudit;
use App\Models\Nominee;
use App\Models\User;
use App\Models\Voter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use LogicException;
use Tests\TestCase;

class AdminPanelTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_admin_login(): void
    {
        $this->get('/admin')->assertRedirect();
    }

    public function test_admin_users_can_access_the_panel(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/admin')->assertOk();
    }

    public function test_non_admin_users_are_rejected(): void
    {
        $user = User::factory()->create(['role' => 'support']);

        $this->actingAs($user)->get('/admin')->assertForbidden();
    }

    public function test_voter_guard_grants_no_admin_access(): void
    {
        $voter = Voter::factory()->create();

        $this->actingAs($voter, 'voter')->get('/admin')->assertRedirect();
    }

    public function test_admin_mutations_are_audited_with_before_and_after(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $nominee = Nominee::factory()->create(['display_name' => 'Before Name']);

        $this->actingAs($admin);
        $nominee->update(['display_name' => 'After Name']);

        $audit = AdminAudit::query()->sole();
        $this->assertSame($admin->id, $audit->admin_id);
        $this->assertSame('updated', $audit->action);
        $this->assertSame((string) $nominee->id, $audit->object_id);
        $this->assertSame('Before Name', $audit->before_json['display_name']);
        $this->assertSame('After Name', $audit->after_json['display_name']);
    }

    public function test_mutations_without_an_admin_session_are_not_audited(): void
    {
        $nominee = Nominee::factory()->create();
        $nominee->update(['display_name' => 'Changed by system']);

        $this->assertSame(0, AdminAudit::query()->count());
    }

    public function test_audit_records_are_immutable(): void
    {
        $admin = User::factory()->create();
        $this->actingAs($admin);

        Nominee::factory()->create();
        $audit = AdminAudit::query()->firstOrFail();

        $this->expectException(LogicException::class);
        $audit->update(['action' => 'tampered']);
    }
}
