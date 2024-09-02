export function fitSigmoid(hues, responses, polarity, tailProbability = 0.2) {
  // Initialize parameters
  let a = 0.2 // Initial guess for a
  let b = 0 // Initial guess for b
  const priorA = { mean: 0.2, sd: 0.5 }
  const priorB = { mean: 0, sd: 30 }

  // Helper functions
  const sigmoid = (x) => {
    if (x >= 0) {
      return 1 / (1 + Math.exp(-x))
    } else {
      const z = Math.exp(x)
      return z / (1 + z)
    }
  }

  const logSigmoid = (x) => {
    if (x >= 0) {
      return -Math.log1p(Math.exp(-x))
    } else {
      return x - Math.log1p(Math.exp(x))
    }
  }

  const logLikelihood = (a, b) => {
    return hues.reduce((sum, hue, i) => {
      const z = a * (hue - 180 + b)
      return sum + (responses[i] ? logSigmoid(z) : logSigmoid(-z))
    }, 0)
  }

  // Newton's method
  for (let iter = 0; iter < 10; iter++) {
    // TODO: Add convergence check
    const ll = logLikelihood(a, b)
    const grad_a =
      hues.reduce((sum, hue, i) => {
        const z = a * (hue - 180 + b)
        const s = sigmoid(z)
        return sum + (responses[i] - s) * (hue - 180 + b)
      }, 0) -
      (a - priorA.mean) / priorA.sd ** 2
    const grad_b =
      hues.reduce((sum, hue, i) => {
        const z = a * (hue - 180 + b)
        const s = sigmoid(z)
        return sum + (responses[i] - s) * a
      }, 0) -
      (b - priorB.mean) / priorB.sd ** 2
    const hess_aa =
      hues.reduce((sum, hue) => {
        const z = a * (hue - 180 + b)
        const s = sigmoid(z)
        return sum - s * (1 - s) * (hue - 180 + b) ** 2
      }, 0) -
      1 / priorA.sd ** 2
    const hess_ab = hues.reduce((sum, hue) => {
      const z = a * (hue - 180 + b)
      const s = sigmoid(z)
      return sum - s * (1 - s) * a * (hue - 180 + b)
    }, 0)
    const hess_bb =
      hues.reduce((sum, hue) => {
        const z = a * (hue - 180 + b)
        const s = sigmoid(z)
        return sum - s * (1 - s) * a ** 2
      }, 0) -
      1 / priorB.sd ** 2

    const det = hess_aa * hess_bb - hess_ab ** 2
    const delta_a = (hess_bb * grad_a - hess_ab * grad_b) / det
    const delta_b = (hess_aa * grad_b - hess_ab * grad_a) / det

    a -= delta_a
    b -= delta_b

    // Clamp a to prevent divergence.
    a = Math.max(0.01, a)

    console.log(a, b)

    if (Math.abs(delta_a) < 1e-6 && Math.abs(delta_b) < 1e-6) {
      break
    }
  }

  // Calculate the new probe value
  if (polarity == 0) {
    polarity = Math.random() < 0.5 ? 1 : -1
  }
  let percentile = polarity > 0 ? tailProbability : 1 - tailProbability
  let newProbe = 180 - b + Math.log(percentile / (1 - percentile)) / a
  newProbe = Math.max(120, Math.min(newProbe, 240))

  return { a, b, polarity, newProbe }
}
