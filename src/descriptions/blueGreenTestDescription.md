# Blue-Green Color Test: Purpose and Method

## Purpose

The Blue-Green Color Test is a web application designed to measure an individual's personal blue-green color boundary. Its primary goals are:

1. To assess how people categorize colors in the blue-green spectrum.
2. To explore potential variations in color perception and categorization across different individuals and populations.
3. To gather anonymous data for research purposes in color perception and linguistics.

## Method

### Overview

The application uses a psychophysical method to determine the user's blue-green boundary. It presents a series of color stimuli and asks the user to categorize each as either "blue" or "green". The test employs an adaptive algorithm to efficiently estimate the user's color boundary.

### Technical Implementation

#### Color Space

- The test focuses on the blue-green hue range between 150 and 210 in the HSL (Hue, Saturation, Lightness) color space.
- Colors are presented at maximum saturation (100%) and medium lightness (50%).

#### Adaptive Algorithm

The test uses a maximum-a-posteriori (MAP) estimation algorithm to determine which colors to present and to estimate the user's blue-green boundary. Specifically:

1. **Sigmoid Model**: The user's responses are modeled using a sigmoid (logistic) function:
   P(blue | hue) = 1 / (1 + exp(-a \* (hue - 180 + b)))
   Where 'a' represents the steepness of the transition, and 'b' represents the shift of the boundary from 180.

2. **Fitting Process**: The `fitSigmoid` function in `glmUtils.js` implements a second-order Newton method to fit the sigmoid model to the user's responses. It uses:

   - A log-likelihood function based on the user's responses.
   - Priors on the 'a' and 'b' parameters to regularize the fit.
   - Gradient and Hessian computations for the Newton updates.

3. **Adaptive Sampling**: After each response, the algorithm calculates a new probe value (next color to show) based on:

   - The current estimate of the sigmoid parameters.
   - A tail probability (default 0.4) to focus sampling near the estimated boundary.
   - A polarity switch to alternate between probing above and below the estimated boundary.

4. **Convergence**: The fitting process runs for up to 10 iterations or until the parameter updates become very small (< 1e-6).

#### Test Procedure

1. **Initialization**:

   - The test starts with a random color at either hue 150 or 210.
   - An anonymous ID is generated for the user.

2. **Color Presentation**:

   - Colors are presented as full-screen backgrounds.
   - A noise mask is briefly shown between color presentations to mitigate visual adaptation.

3. **User Interaction**:

   - Users click buttons to categorize each color as "blue" or "green".
   - The test runs for a fixed number of rounds (MAX_ROUNDS).

4. **Data Logging**:

   - Each round's data is logged, including:
     - Presented hue
     - User's response
     - Calculated new probe value
     - Sigmoid parameters
     - Timing information

5. **Results Calculation**:

   - The final blue-green boundary is calculated as 180 - b, where b is the shift parameter from the sigmoid fit.
   - The user's result is compared to a pre-computed population distribution.

6. **Results Presentation**:

   - A graph shows the user's estimated sigmoid curve and their boundary relative to the population distribution.
   - Text explains the user's result in relation to the population.

7. **Data Submission**:
   - Anonymous test data, including all responses and device information, is submitted to a Supabase database.
   - Optional demographic information (first language, color blindness) can be submitted separately.

### Additional Features

- **Responsive Design**: The application adapts to different screen sizes and devices.
- **Accessibility**: High contrast buttons and text are used for better readability.
- **Error Handling**: The application includes error catching and logging for robustness.
- **About Section**: Detailed information about the test's purpose, validity, and technical details is provided.

## Limitations and Considerations

- The test's validity depends on the user's display calibration and ambient lighting conditions.
- It's not a diagnostic tool for color vision deficiencies.
- The population comparison data is based on early experiments and may not be fully representative.

## Future Directions

- Potential for creating versions for other color pairs.
- Possibility of more detailed analysis of demographic factors influencing color categorization.
- Continuous refinement of the adaptive algorithm for more efficient testing.

This application serves as both an entertaining interactive experience for users and a valuable data collection tool for research in color perception and categorization.
