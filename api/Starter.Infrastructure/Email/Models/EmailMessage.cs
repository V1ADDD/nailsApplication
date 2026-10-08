namespace Starter.Infrastructure.Email.Models;

public sealed record EmailMessage(string To, string Subject, string Text, string Html);
