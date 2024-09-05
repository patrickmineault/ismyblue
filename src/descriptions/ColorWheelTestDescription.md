<!-- DO NOT CHANGE THIS DESCRIPTION DOCUMENT!! -->

# Multi-Color Categorization Test: Purpose and Method

## Purpose

The Multi-Color Categorization Test is an extended version of the Blue-Green Color Test, designed to measure an individual's personal color boundaries across the entire color spectrum. Its primary goals are:

1. To assess how people categorize colors across multiple color pair boundaries.
2. To explore potential variations in color perception and categorization across different individuals and populations for a wider range of colors.
3. To gather anonymous data for research purposes in color perception, linguistics, and potential cultural differences in color categorization.
4. To provide a more comprehensive and engaging user experience by testing multiple color boundaries simultaneously.

## Method

### Overview

The application uses a psychophysical method to determine the user's color boundaries for six color pairs. It presents a series of color stimuli and asks the user to categorize each color into one of two adjacent color categories. The test employs an adaptive algorithm to efficiently estimate the user's color boundaries for each pair.

### Color Pairs

The test focuses on six color pairs, covering the entire color wheel:

1. Red vs. Orange
2. Orange vs. Yellow
3. Yellow vs. Green
4. Green vs. Blue
5. Blue vs. Purple
6. Purple vs. Red

### Technical Implementation

#### Color Space

- The test uses the HSL (Hue, Saturation, Lightness) color space.
- Colors are presented at maximum saturation (100%) and medium lightness (50%).
- The hue ranges for each color pair will be determined based on standard color wheel divisions, with adjustments made based on preliminary testing.

#### Adaptive Algorithm

The test uses a maximum-a-posteriori (MAP) estimation algorithm for each color pair, similar to the original Blue-Green test. Specifically:

1. **Sigmoid Model**: For each color pair, the user's responses are modeled using a sigmoid (logistic) function:
   P(color1 | hue) = 1 / (1 + exp(-a \* (hue - midpoint + b)))
   Where 'a' represents the steepness of the transition, 'b' represents the shift of the boundary from the midpoint, and 'midpoint' is the nominal center of the hue range for that color pair.

2. **Fitting Process**: The `fitSigmoid` function will be adapted to handle multiple color pairs:

   - It will maintain separate parameters (a, b) for each color pair.
   - The log-likelihood function, gradients, and Hessian computations will be updated to handle multiple color pairs simultaneously.
   - Priors on the 'a' and 'b' parameters will be adjusted for each color pair based on preliminary data or theoretical considerations.

3. **Adaptive Sampling**: After each response, the algorithm calculates new probe values for each color pair:

   - It uses the current estimates of the sigmoid parameters for each pair.
   - A tail probability (default may be adjusted) to focus sampling near the estimated boundaries.
   - A polarity switch to alternate between probing above and below the estimated boundaries for each pair.

4. **Convergence**: The fitting process runs for a fixed number of iterations or until parameter updates become very small for all color pairs.

#### Test Procedure

1. **Initialization**:

   - An anonymous ID is generated for the user.
   - Initial colors for each pair are randomly selected from the extremes of their respective ranges.

2. **Color Presentation**:

   - Colors are presented as full-screen backgrounds.
   - The order of color pair presentation rotates through all six pairs before repeating.
   - A noise mask is briefly shown between color presentations to mitigate visual adaptation.

3. **User Interaction**:

   - Users click buttons to categorize each color into one of the two relevant categories for the current pair.
   - The test runs for a fixed total number of rounds, ensuring roughly equal numbers of trials for each color pair.

4. **Data Logging**:

   - Each round's data is logged, including:
     - Presented hue and corresponding color pair
     - User's response
     - Calculated new probe value for the color pair
     - Updated sigmoid parameters for the color pair
     - Timing information

5. **Results Calculation**:

   - The final color boundary for each pair is calculated based on the fitted sigmoid parameters.
   - The user's results are compared to pre-computed population distributions for each color pair.

6. **Results Presentation**:

   - A circular graph (color wheel) shows the user's estimated boundaries for all color pairs.
   - Individual graphs for each color pair show the user's sigmoid curve and boundary relative to the population distribution.
   - Text explains the user's results in relation to the population for each color pair and overall.

7. **Data Submission**:
   - Anonymous test data, including all responses, device information, and calculated boundaries for all color pairs, is submitted to a database.
   - Optional demographic information (e.g., first language, color blindness, cultural background) can be submitted separately.

### Additional Features

- **Responsive Design**: The application adapts to different screen sizes and devices, ensuring consistent color presentation.
- **Accessibility**: High contrast buttons and text are used for better readability. Consider adding options for colorblind-friendly modes or alternative test versions.
- **Error Handling**: The application includes error catching and logging for robustness, handling potential issues with specific color pairs or overall test progression.
- **About Section**: Detailed information about the test's purpose, validity, and technical details is provided, including explanations of how the multi-color test differs from and expands upon the original blue-green test.
- **Progress Indicator**: A progress bar or indicator shows how far along the user is in the overall test, considering all color pairs.

## Limitations and Considerations

- The test's validity depends on the user's display calibration and ambient lighting conditions, which becomes more critical when testing multiple color boundaries.
- It's not a diagnostic tool for color vision deficiencies, but it may provide insights into potential color perception variations.
- The population comparison data will need to be carefully collected and may require ongoing refinement as more data is gathered.
- The longer duration of the multi-color test compared to the original blue-green test may impact user engagement and completion rates.

## Future Directions

- Analysis of correlations between boundaries of different color pairs within individuals.
- Investigation of cultural, linguistic, or geographic factors influencing color categorization across the spectrum.
- Development of more sophisticated adaptive algorithms that can adjust the testing strategy based on emerging patterns in a user's responses across color pairs.
- Potential for creating versions with finer-grained color distinctions or focusing on specific parts of the color spectrum based on research interests.
- Integration with other perceptual or cognitive tests to explore relationships between color categorization and other aspects of perception or language.

This extended Multi-Color Categorization Test serves as a comprehensive tool for exploring human color perception and categorization across the entire visible spectrum, providing rich data for research while offering users an engaging and informative experience about their personal color boundaries.
