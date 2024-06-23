namespace BookManager.Domain.Entities;

public class TotalReadingTime
{
    public Guid BookId { get; set; }

    public Book Book { get; set; } = null!;

    public Guid TicketId { get; set; }

    public Ticket Ticket { get; set; } = null!;

    public long TimeInSeconds { get; set; } = 0;
}