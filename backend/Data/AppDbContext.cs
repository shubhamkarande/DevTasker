using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using DevTasker.API.Models.Entities;

namespace DevTasker.API.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();
    public DbSet<Board> Boards => Set<Board>();
    public DbSet<Column> Columns => Set<Column>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Label> Labels => Set<Label>();
    public DbSet<TaskLabel> TaskLabels => Set<TaskLabel>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // ApplicationUser configuration
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.Property(e => e.Role).HasMaxLength(50);
        });

        // Project configuration
        builder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Key).HasMaxLength(10).IsRequired();
            entity.HasIndex(e => e.Key).IsUnique();

            entity.HasOne(e => e.Owner)
                .WithMany(u => u.OwnedProjects)
                .HasForeignKey(e => e.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ProjectMember configuration
        builder.Entity<ProjectMember>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.ProjectId, e.UserId }).IsUnique();

            entity.HasOne(e => e.Project)
                .WithMany(p => p.Members)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.ProjectMemberships)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Board configuration
        builder.Entity<Board>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();

            entity.HasOne(e => e.Project)
                .WithMany(p => p.Boards)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Column configuration
        builder.Entity<Column>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(50).IsRequired();

            entity.HasOne(e => e.Board)
                .WithMany(b => b.Columns)
                .HasForeignKey(e => e.BoardId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TaskItem configuration
        builder.Entity<TaskItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(5000);
            entity.Property(e => e.Priority).HasMaxLength(20);
            entity.Property(e => e.TaskKey).HasMaxLength(20);

            entity.HasOne(e => e.Column)
                .WithMany(c => c.Tasks)
                .HasForeignKey(e => e.ColumnId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Assignee)
                .WithMany(u => u.AssignedTasks)
                .HasForeignKey(e => e.AssigneeId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Label configuration
        builder.Entity<Label>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Color).HasMaxLength(10).IsRequired();

            entity.HasOne(e => e.Project)
                .WithMany(p => p.Labels)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TaskLabel configuration (many-to-many)
        builder.Entity<TaskLabel>(entity =>
        {
            entity.HasKey(e => new { e.TaskId, e.LabelId });

            entity.HasOne(e => e.Task)
                .WithMany(t => t.TaskLabels)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Label)
                .WithMany(l => l.TaskLabels)
                .HasForeignKey(e => e.LabelId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Comment configuration
        builder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).HasMaxLength(2000).IsRequired();

            entity.HasOne(e => e.Task)
                .WithMany(t => t.Comments)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ActivityLog configuration
        builder.Entity<ActivityLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Action).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Details).HasMaxLength(1000);

            entity.HasOne(e => e.Task)
                .WithMany(t => t.ActivityLogs)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.ActivityLogs)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
