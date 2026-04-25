// C program to solve sudoku using backtracking
#include <stdio.h>
#include <emscripten/emscripten.h>

// UNASSIGNED is used for empty
// cells in sudoku grid
#define UNASSIGNED 0

// N is used for the size of Sudoku grid.
// Size will be NxN
#define N 9

// Function declarations
int FindUnassignedLocation(int grid[N][N], int* row,
                           int* col);
int isSafe(int grid[N][N], int row, int col, int num);
int SolveSudoku(int grid[N][N]);
void printGrid(int grid[N][N]);
int UsedInRow(int grid[N][N], int row, int num);
int UsedInCol(int grid[N][N], int col, int num);
int UsedInBox(int grid[N][N], int boxStartRow,
              int boxStartCol, int num);
int solve_sudoku(int *input);

/* Takes a partially filled-in grid and attempts
to assign values to all unassigned locations in
such a way to meet the requirements for
Sudoku solution (non-duplication across rows,
columns, and boxes) */
int SolveSudoku(int grid[N][N])
{
    int row, col;

    // If there is no unassigned location,
    // we are done
    if (!FindUnassignedLocation(grid, &row, &col))
        // success!
        return 1;

    // Consider digits 1 to 9
    for (int num = 1; num <= 9; num++) {
        // Check if looks promising
        if (isSafe(grid, row, col, num)) {
            // Make tentative assignment
            grid[row][col] = num;

            // Return, if success
            if (SolveSudoku(grid))
                return 1;

            // Failure, unmake & try again
            grid[row][col] = UNASSIGNED;
        }
    }

    // This triggers backtracking
    return 0;
}

/* Searches the grid to find an entry that is
still unassigned. If found, the reference
parameters row, col will be set the location
that is unassigned, and true is returned.
If no unassigned entries remain, false is returned. */
int FindUnassignedLocation(int grid[N][N], int* row,
                           int* col)
{
    for (*row = 0; *row < N; (*row)++) {
        for (*col = 0; *col < N; (*col)++) {
            if (grid[*row][*col] == UNASSIGNED) {
                return 1;
            }
        }
    }
    return 0;
}

/* Returns a boolean which indicates whether
an assigned entry in the specified row matches
the given number. */
int UsedInRow(int grid[N][N], int row, int num)
{
    for (int col = 0; col < N; col++) {
        if (grid[row][col] == num) {
            return 1;
        }
    }
    return 0;
}

/* Returns a boolean which indicates whether
an assigned entry in the specified column
matches the given number. */
int UsedInCol(int grid[N][N], int col, int num)
{
    for (int row = 0; row < N; row++) {
        if (grid[row][col] == num) {
            return 1;
        }
    }
    return 0;
}

/* Returns a boolean which indicates whether
an assigned entry within the specified 3x3 box
matches the given number. */
int UsedInBox(int grid[N][N], int boxStartRow,
              int boxStartCol, int num)
{
    for (int row = 0; row < 3; row++) {
        for (int col = 0; col < 3; col++) {
            if (grid[row + boxStartRow][col + boxStartCol]
                == num) {
                return 1;
            }
        }
    }
    return 0;
}

/* Returns a boolean which indicates whether
it will be legal to assign num to the given
row, col location. */
int isSafe(int grid[N][N], int row, int col, int num)
{
    /* Check if 'num' is not already placed in
    current row, current column
    and current 3x3 box */
    return !UsedInRow(grid, row, num)
           && !UsedInCol(grid, col, num)
           && !UsedInBox(grid, row - row % 3, col - col % 3,
                         num)
           && grid[row][col] == UNASSIGNED;
}

/* A utility function to print grid */
void printGrid(int grid[N][N])
{
    for (int row = 0; row < N; row++) {
        for (int col = 0; col < N; col++) {
            printf("%d ", grid[row][col]);
        }
        printf("\n");
    }
}

// Driver Code
int main()
{
    // 0 means unassigned cells
    int grid[N][N] = { { 5, 3, 0, 0, 7, 0, 0, 0, 0 },
                       { 6, 0, 0, 1, 9, 5, 0, 0, 0 },
                       { 0, 9, 8, 0, 0, 0, 0, 6, 0 },
                       { 8, 0, 0, 0, 6, 0, 0, 0, 3 },
                       { 4, 0, 0, 8, 0, 3, 0, 0, 1 },
                       { 7, 0, 0, 0, 2, 0, 0, 0, 6 },
                       { 0, 6, 0, 0, 0, 0, 2, 8, 0 },
                       { 0, 0, 0, 4, 1, 9, 0, 0, 5 },
                       { 0, 0, 0, 0, 8, 0, 0, 7, 9 } };

    if (SolveSudoku(grid))
        printGrid(grid);
    else
        printf("No solution exists");

    return 0;
}

EMSCRIPTEN_KEEPALIVE
int solve_sudoku(int *input)
{
    int grid[N][N];

    for (int i = 0; i < 81; i++) {
        grid[i / 9][i % 9] = input[i];
    }

    int solved = SolveSudoku(grid);

    if (!solved) {
        return 0;
    }

    for (int i = 0; i < 81; i++) {
        input[i] = grid[i / 9][i % 9];
    }

    return 1;
}
