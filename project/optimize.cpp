#include <iostream>
#include <vector>
#include <span>
#include <cmath>



auto interior(auto &x) {
    return std::span(x.begin()+1, x.end()-1);
}



auto laplacian(auto x, auto i, auto j) {
    return (x[i][j-1] + x[i][j+1] + x[i-1][j] + x[i+1][j]) / 2 - 2 * x[i][j];
}



auto energy_floor(auto u) {
    return (u.size() - 2) * (u.front().size() - 2) * 0.001;
}



auto energy(auto u, auto v) {
    double E{};
    auto m = u.size(), n = u.front().size();

    // Dynamic
    for (auto row: interior(v)) {
        for (auto v_ij: interior(row)) {
            E += std::pow(v_ij, 2) / 2;
        }
    }

    // Potential
    for (size_t j=0; j<n; j++) {
        for (size_t i=0; i<m; i++) {
            if (j==0 || j==n-1 || i==m-1) continue;
            E += std::pow(u[i][j]-u[i+1][j], 2) / 4;
        }
    }
    for (size_t j=0; j<n; j++) {
        for (size_t i=0; i<m; i++) {
            if (j==n-1 || i==0 || i==m-1) continue;
            E += std::pow(u[i][j]-u[i][j+1], 2) / 4;
        }
    }

    return E;
}



auto step(auto &u, auto &v, auto c, auto dt) {
    auto m = u.size(), n = u.front().size();

    // Update v
    for (size_t j=0; j<n; j++) {
        for (size_t i=0; i<m; i++) {
            if (j==0 || j==n-1 || i==0 || i==m-1) continue;
            auto L = laplacian(u, i, j);
            v[i][j] = (1 - dt * c) * v[i][j] + dt * L;
        }
    }

    // Update u
    for (size_t j=0; j<n; j++) {
        for (size_t i=0; i<m; i++) {
            if (j==0 || j==n-1 || i==0 || i==m-1) continue;
            u[i][j] += dt * v[i][j];
        }
    }
}



int main() {
    // Simulation parameters
    const int rows = 40;
    const double c = 0.05,
                 dt = 0.01,
                 u0 = 1, v0 = 0;
    double t = 0;

    // Initialize u and v
    auto u = std::vector<std::vector<double>>(rows, std::vector<double>(rows));
    auto v = u;
    for (auto &row: interior(u)) std::fill(interior(row).begin(), interior(row).end(), u0);

    // Solve
    while (energy(u, v) > energy_floor(u)) {
        step(u, v, c, dt);
        t += dt;
    }

    // Print simulation time and exit
    std::cout << t << std::endl;
    return 0;
}

