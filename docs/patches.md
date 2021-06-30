# How to Create Color Patches

This is a short guide on how to generate a specific number of color patches. This document will go through the basic math to find the values for each patch.

Let's get into it.

## Generating Colors for One Channel

To start understanding the logic, let's give ourselves a simple problem.

Let's assume we have only one channel to generate values for. We have 256 values in a channel, going from 0 to 255.

From each channel, we want 16 values to come out of it.

To make this calculation, it appears to be a simple case of dividing 256 by 16. Right?

But in this scenario, we want to include black (value 0) as a color.

Knowing we need to include black, we can remove one color off the total. Instead of 16 values, we now have 15.

The rest is simple:

Divide 255 by 15, and you get 17. 17 will now be the step size we need for getting to 255. The series is as follows:

17, 34, 51, 68, 85, 102, 119, 136, 153, 170, 187, 204, 221, 238, 255

If you count the length of that series, it'll add up to 15. Adding black, our total rises back to 16.

The final series:

0, 17, 34, 51, 68, 85, 102, 119, 136, 153, 170, 187, 204, 221, 238, 255

## Partial Divisors

In the previous example, we were lucky that we wanted 16 colors from the generator. After subtracting for black, we were able to cleanly divide 255 by 15.

The number 255 however isn't divisible by all numbers without extra decimal places. There are only a few factors of 255, including:

1, 3, 5, 15, 17, 51, 85 and 255.

But let's say we want 8 colors per channel. Or 4. Or 36. How should we calculate the values now?

The answer: we can use the same principle, except this time we need an additional rounding step.

Let's now try getting 8 colors from a single channel. Using the same algorithm, we subtract one color for black, then divide 255 by 7.

This nets us 36.43. Not exactly an easy number to work with, but this isn't something we should worry about. This number will divide 255 exactly into 7.

Now, let's generate the values required:

0, 36.43, 72.86, 109.29, 145.71, 182.14, 218.57, 255.

And round each value:

0, 36, 73, 109, 146, 182, 219, 255.

That's our final series!

## Multiple Channels

Now we get to the fun part: getting colors from every channel. When using the RGB color system, we have three values to work with: Red, Green and Blue. Each of these values range from 0 to 255. This nets us more than 16 million combinations to choose from!

But like the last problems, we can simplify then build up to more complicated equations later.

Let's start with trying to get 2 colors per channel: 2 for red, 2 for green and 2 for blue.

For each of these color channels, we can then apply the same algorithm we used in the previous sections.

For the red channel, we need 2 colors. We subtract one for black. We then divide 255 by 1 to get a gap of 255.

The final series for red is:

Red: 0, 255.

We then repeat the same for green and blue.

Green: 0, 255.
Blue: 0, 255.

We now need to find all the combinations we can get from these three channels. Some trial and error, and you'll get the following:

(0, 0, 0), (0, 0, 255), (0, 255, 0), (0, 255, 255), (255, 0, 0), (255, 0, 255), (255, 255, 0), (255, 255, 255)

The first thing to note is the number of elements: there's 8 values: 2^3. The second thing: every value is cycled through once through each color channel. This will be important later.

Let's try the same for three colors per channel:

Red: 0, 127, 255
Green: 0, 127, 255
Blue: 0, 127, 255

Our final series should look like this:

(0, 0, 0), (0, 0, 127), (0, 0, 255), (0, 127, 0), (0, 127, 127), (0, 127, 255), (0, 255, 0), (0, 255, 127), (0, 255, 255), (127, 0, 0), (127, 0, 127), (127, 0, 255), (127, 127, 0), (127, 127, 127), (127, 127, 255), (127, 255, 0), (127, 255, 127), (127, 255, 255), (255, 0, 0), (255, 0, 127), (255, 0, 255), (255, 127, 0), (255, 127, 127), (255, 127, 255), (255, 255, 0), (255, 255, 127), (255, 255, 255)

This series nets us 27 values, or 3^3 values. The same cycling pattern also occurs in this series. From these two examples we can extrapolate to some simple rules:

1. The total number of values in our series will be the **colors per channel ^ 3**. If we have 3 colors per channel, we will have 27 values. If we have 16 colors per channel, we'll get 4096.

2. Conversely, to find the number of colors we need per channel, we need to find the **cube root of the total number of colors**. 4096 colors will net us 16 colors per channel.

3. To generate the values needed, we need to cycle through all color combinations per channel once. For our two color example, we need to cycle through 0 and 255 in the red channel, then 0 and 255 in the red and green channels, before doing so in all three channels.
