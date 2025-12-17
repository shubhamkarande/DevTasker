using Microsoft.EntityFrameworkCore;
using DevTasker.API.Data;
using DevTasker.API.Models.Entities;

namespace DevTasker.Tests;

public abstract class TestBase : IDisposable
{
    protected readonly AppDbContext Context;
    
    protected TestBase()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        
        Context = new AppDbContext(options);
        Context.Database.EnsureCreated();
    }
    
    protected async Task<ApplicationUser> CreateTestUserAsync(string email = "test@test.com", string role = "TeamMember")
    {
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = email,
            UserName = email,
            FirstName = "Test",
            LastName = "User",
            Role = role,
            CreatedAt = DateTime.UtcNow
        };
        
        Context.Users.Add(user);
        await Context.SaveChangesAsync();
        return user;
    }
    
    protected async Task<Project> CreateTestProjectAsync(Guid ownerId, string name = "Test Project")
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = name,
            Key = "TST",
            OwnerId = ownerId,
            CreatedAt = DateTime.UtcNow
        };
        
        Context.Projects.Add(project);
        await Context.SaveChangesAsync();
        return project;
    }
    
    protected async Task<Board> CreateTestBoardAsync(Guid projectId, string name = "Test Board")
    {
        var board = new Board
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Name = name,
            CreatedAt = DateTime.UtcNow
        };
        
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();
        return board;
    }
    
    protected async Task<Column> CreateTestColumnAsync(Guid boardId, string name = "Test Column", int orderIndex = 0)
    {
        var column = new Column
        {
            Id = Guid.NewGuid(),
            BoardId = boardId,
            Name = name,
            OrderIndex = orderIndex
        };
        
        Context.Columns.Add(column);
        await Context.SaveChangesAsync();
        return column;
    }
    
    public void Dispose()
    {
        Context.Database.EnsureDeleted();
        Context.Dispose();
    }
}
