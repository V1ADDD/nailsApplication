using System.Reflection;

namespace Nails.Infrastructure.Common;

public static class BuildContext
{
    private const string DocumentGenerator = "GetDocument.Insider";

    public static bool IsGeneratingOpenApiDocument { get; } =
        Assembly.GetEntryAssembly()?.GetName().Name == DocumentGenerator;
}
