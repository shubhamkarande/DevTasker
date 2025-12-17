using DevTasker.API.Services;
using DevTasker.API.Models.Requests;
using DevTasker.API.Models.Entities;

namespace DevTasker.Tests;

public class BoardServiceTests : TestBase
{
    private readonly BoardService _boardService;
    
    public BoardServiceTests()
    {
        _boardService = new BoardService(Context);
    }
    
    [Fact]
    public async Task CreateBoard_WithDefaultColumns_CreatesBoard()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var project = await CreateTestProjectAsync(user.Id);
        
        var request = new CreateBoardRequest
        {
            ProjectId = project.Id,
            Name = "Sprint 1",
            CreateDefaultColumns = true
        };
        
        // Act
        var result = await _boardService.CreateBoardAsync(request, user.Id);
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal("Sprint 1", result.Name);
    }
    
    [Fact]
    public async Task GetBoardWithDetails_ReturnsColumnsAndTasks()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var project = await CreateTestProjectAsync(user.Id);
        var board = await CreateTestBoardAsync(project.Id);
        var column = await CreateTestColumnAsync(board.Id, "Todo");
        
        // Add a task
        Context.Tasks.Add(new TaskItem
        {
            Id = Guid.NewGuid(),
            ColumnId = column.Id,
            Title = "Test Task",
            Priority = "Medium",
            OrderIndex = 0,
            TaskKey = "TST-1",
            CreatedAt = DateTime.UtcNow
        });
        await Context.SaveChangesAsync();
        
        // Act
        var result = await _boardService.GetBoardByIdAsync(board.Id, user.Id);
        
        // Assert
        Assert.NotNull(result);
        Assert.Single(result.Columns);
        Assert.Single(result.Columns.First().Tasks);
        Assert.Equal("Test Task", result.Columns.First().Tasks.First().Title);
    }
    
    [Fact]
    public async Task CreateColumn_AddsColumnToBoard()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var project = await CreateTestProjectAsync(user.Id);
        var board = await CreateTestBoardAsync(project.Id);
        
        var request = new CreateColumnRequest
        {
            Name = "In Progress",
            Color = "#3498db"
        };
        
        // Act
        var result = await _boardService.CreateColumnAsync(board.Id, request, user.Id);
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal("In Progress", result.Name);
        Assert.Equal("#3498db", result.Color);
    }
    
    [Fact]
    public async Task ReorderColumns_UpdatesOrderIndices()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var project = await CreateTestProjectAsync(user.Id);
        var board = await CreateTestBoardAsync(project.Id);
        var column1 = await CreateTestColumnAsync(board.Id, "Column 1", 0);
        var column2 = await CreateTestColumnAsync(board.Id, "Column 2", 1);
        var column3 = await CreateTestColumnAsync(board.Id, "Column 3", 2);
        
        // Create request with reversed order
        var request = new ReorderColumnsRequest
        {
            ColumnIds = new List<Guid> { column3.Id, column2.Id, column1.Id }
        };
        
        // Act
        var result = await _boardService.ReorderColumnsAsync(board.Id, request, user.Id);
        
        // Assert
        Assert.True(result);
        
        var updatedColumn1 = await Context.Columns.FindAsync(column1.Id);
        var updatedColumn3 = await Context.Columns.FindAsync(column3.Id);
        
        Assert.Equal(2, updatedColumn1!.OrderIndex);
        Assert.Equal(0, updatedColumn3!.OrderIndex);
    }
    
    [Fact]
    public async Task DeleteColumn_RemovesColumn()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var project = await CreateTestProjectAsync(user.Id);
        var board = await CreateTestBoardAsync(project.Id);
        var column = await CreateTestColumnAsync(board.Id);
        
        // Act
        var result = await _boardService.DeleteColumnAsync(column.Id, user.Id);
        
        // Assert
        Assert.True(result);
        Assert.Null(await Context.Columns.FindAsync(column.Id));
    }
}
