---
---

# Example Problem: Mountain Range

This is a meant to be  the [semester-long project](project/overview.md) so that you can get an idea of what to do. The goal of this program is to crudely simulate the evolution of a mountain range given uplift rates:

![Evolution of Simulated Mountain Range, with Steepness and its Derivative Shown](/img/example-code-animation-1D.gif)

Where to download: TODO

How to use: TODO

## The Problem

In our crude analogy, height $h$ is determined by:

$$\dot h = r - h^3 + \nabla^2 h$$

...where $\dot h$ is the time derivative of $h$ and $\nabla^2$ is the Laplace operator.

$r$ represents the rate of uplift, $-h^3$ represents equilibrating forces that increase superlinearly with height or depth (e.g. glacial erosion), and $\nabla^2 h$ represents the inherent instability of steep slopes. $r$ is taken to be constant for simplicity.

We define the steepness to be the average squared 2-norm of the gradient of the height across the mountain range:

$$s = \frac{1}{A} \int_M \left\Vert \nabla h \right\Vert_2^2 dA$$

The [derivative of the steepness with respect to time](Time Derivative of Euclidean Norm of Gradient) is:

$$\dot s = \frac{2}{A} \int_M \nabla h \cdot \nabla \dot h \space dA$$

The simulation stops when $\dot s$ drops below zero--i.e. when the mountain range is at its steepest.

### Discretization

We assume [Neumann boundary condition](https://en.wikipedia.org/wiki/Neumann_boundary_condition)--namely, the derivative at the edge is zero-ish.

We approximate the gradient at a point as:

$$\nabla h_{i,j,...} \approx \left(\frac{x_{i+1,j,...}-{x_{i-1,j,...}}}{2}, \frac{x_{i,j+1,...}-{x_{i,j-1,...}}}{2}, ... \right)$$

The Laplacian is [approximated just like in the real problem](project/overview.md#laplacian).

At the edges, we just pretend the point beyond the edge has the same value to simulate a zero derivative. TODO: should I instead just let it be totally free by acting like it's just a "reflection" of the inner point about the edge point?



## Appedix N: Mathematical Justification

### Time Derivative of Euclidean Norm of Gradient

The derivative of the two-norm of the gradient of $v$ with respect to time is the sum of the time derivatives of the squared spatial derivatives of $v$:

$$\frac{\partial}{\partial t} \left\Vert \nabla v \right\Vert_2^2 = \sum_n^N \frac{\partial}{\partial t} \left( \frac{\partial v}{\partial v_n} \right)^2$$

...where each of $$v_n$$ are the elements of $$N$$-dimensional $$v$$. By the chain rule this becomes:

$$\sum_n^N \frac{\partial}{\partial t} v_n^2 = \sum_n^N 2 \frac{\partial v}{\partial v_n} \frac{\partial\dot v}{\partial v_n}$$

...where $$\dot v$$ represents the derivative of $$v$$ with respect to time. This can be simplified to:

$$\frac{\partial}{\partial t} \left\Vert \nabla v \right\Vert_2^2 = 2 \nabla v \cdot \nabla \dot v$$