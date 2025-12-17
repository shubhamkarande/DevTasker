using DevTasker.API.Services;
using DevTasker.API.Models.Requests;
using DevTasker.API.Models.Entities;

namespace DevTasker.Tests;

public class TaskServiceTests : TestBase
{
    private readonly TaskService _taskService;
    
    public TaskServiceTests()
    {
        _taskService = new TaskService(Context);
    }
    
    [Fact]
    public async Task CreateTask_WithValidData_ReturnsTask()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var project = await CreateTestProjectAsync(user.Id);
        var board = await CreateTestBoardAsync(project.Id);
        var column = await CreateTestColumnAsync(board.Id);
        
        var request = new CreateTaskRequest
        {
            ColumnId = column.Id,
            Title = "New Task",
            Description = "Task description",
            Priority = "High",
            StoryPoints = 5
        };
        
        // Act
        var result = await _taskService.CreateTaskAsync(request, user.Id);
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal("New Task", result.Title);
        Assert.Equal("High", result.Priority);
        Assert.Equal(5, result.StoryPoints);
        Assert.StartsWith("TST-", result.TaskKey);
    }
    
    [Fact]
    public async Task UpdateTask_WithValidData_UpdatesTask()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var project = await CreateTestProjectAsync(user.Id);
        var board = await CreateTestBoardAsync(project.Id);
        var column = await CreateTestColumnAsync(board.Id);
        
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ColumnId = column.Id,
            Title = "Original Title",
            Priority = "Low",
            OrderIndex = 0,
            TaskKey = "TST-1",
            CreatedAt = DateTime.UtcNow
        };
        Context.Tasks.Add(task);
        await Context.SaveChangesAsync();
        
        var request = new UpdateTaskRequest
        {
            Title = "Updated Title",
            Priority = "Critical",
            StoryPoints = 8
        };
        
        // Act
        var result = await _taskService.UpdateTaskAsync(task.Id, request, user.Id);
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated Title", result.Title);
        Assert.Equal("Critical", result.Priority);
        Assert.Equal(8, result.StoryPoints);
    }
    
    [Fact]
    public async Task MoveTask_ToNewColumn_UpdatesColumnAndOrder()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var project = await CreateTestProjectAsync(user.Id);
        var board = await CreateTestBoardAsync(project.Id);
        var sourceColumn = await CreateTestColumnAsync(board.Id, "Todo", 0);
        var targetColumn = await CreateTestColumnAsync(board.Id, "Done", 1);
        
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ColumnId = sourceColumn.Id,
            Title = "Task to Move",
            Priority = "Medium",
            OrderIndex = 0,
            TaskKey = "TST-1",
            CreatedAt = DateTime.UtcNow
        };
        Context.Tasks.Add(task);
        await Context.SaveChangesAsync();
        
        var request = new MoveTaskRequest
        {
            ColumnId = targetColumn.Id,
            OrderIndex = 0
        };
        
        // Act
        var result = await _taskService.MoveTaskAsync(task.Id, request, user.Id);
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.OrderIndex);
        
        // Verify task was moved in database
        var movedTask = await Context.Tasks.FindAsync(task.Id);
        Assert.Equal(targetColumn.Id, movedTask!.ColumnId);
    }
    
    [Fact]
    public async Task AddComment_AddsCommentToTask()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var project = await CreateTestProjectAsync(user.Id);
        var board = await CreateTestBoardAsync(project.Id);
        var column = await CreateTestColumnAsync(board.Id);
        
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ColumnId = column.Id,
            Title = "Task with Comment",
            Priority = "Medium",
            OrderIndex = 0,
            TaskKey = "TST-1",
            CreatedAt = DateTime.UtcNow
        };
        Context.Tasks.Add(task);
        await Context.SaveChangesAsync();
        
        var request = new CreateCommentRequest
        {
            Content = "This is a comment"
        };
        
        // Act
        var result = await _taskService.AddCommentAsync(task.Id, request, user.Id);
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal("This is a comment", result.Content);
    }
    
    [Fact]
    public async Task DeleteTask_RemovesTask()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var project = await CreateTestProjectAsync(user.Id);
        var board = await CreateTestBoardAsync(project.Id);
        var column = await CreateTestColumnAsync(board.Id);
        
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ColumnId = column.Id,
            Title = "Task to Delete",
            Priority = "Low",
            OrderIndex = 0,
            TaskKey = "TST-1",
            CreatedAt = DateTime.UtcNow
        };
        Context.Tasks.Add(task);
        await Context.SaveChangesAsync();
        
        // Act
        var result = await _taskService.DeleteTaskAsync(task.Id, user.Id);
        
        // Assert
        Assert.True(result);
        Assert.Null(await Context.Tasks.FindAsync(task.Id));
    }
}
