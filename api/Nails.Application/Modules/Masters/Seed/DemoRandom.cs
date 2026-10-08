namespace Nails.Application.Modules.Masters.Seed;

public sealed class DemoRandom(int seed)
{
    private const uint Increment = 0x6D2B79F5;
    private const double Range = 4294967296d;

    private uint _state = unchecked((uint)seed);

    public double Next()
    {
        unchecked
        {
            _state += Increment;
            var t = _state;
            t = (t ^ (t >> 15)) * (1 | t);
            t = (t + ((t ^ (t >> 7)) * (61 | t))) ^ t;
            return (t ^ (t >> 14)) / Range;
        }
    }
}
