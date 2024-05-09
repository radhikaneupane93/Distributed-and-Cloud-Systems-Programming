#include <stdio.h>
#include <stdlib.h>
#include <mpi.h>

#define MAX_FILENAME_LENGTH 256
#define MAX_BUFFER_SIZE 1024

int main(int argc, char **argv) {
    int rank, size;
    MPI_Status status;

    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    // Reading the file of numbers in rank 0
    if (rank == 0) {
        if (size <= 2 || size >= 10) {
            printf("This program must run on a minimum of 2 processes and a maximum of 10 processes.\n");
            MPI_Finalize();
            exit(1);
        }

        FILE *fp;
        fp = fopen("input.txt", "r");
        if (fp == NULL) {
            printf("Error opening file!\n");
            MPI_Finalize();
            exit(1);
        }

        int num_elements = 0;
        double *numbers = (double *) malloc(MAX_BUFFER_SIZE * sizeof(double));
        double temp_number;

        while (fscanf(fp, "%lf", &temp_number) == 1) {
            if (num_elements >= MAX_BUFFER_SIZE) {
                printf("Error: too many numbers in file!\n");
                exit(1);
            }
            numbers[num_elements] = temp_number;
            num_elements++;
        }
        fclose(fp);

        // Sharing numbers between all other ranks as equally as possible
        int elements_per_rank = num_elements / (size - 1);
        int remainder = num_elements % (size - 1);

        for (int i = 1; i < size; i++) {
            int send_count = elements_per_rank;
            if (i <= remainder) {
                send_count++;
            }
            MPI_Send(&send_count, 1, MPI_INT, i, 0, MPI_COMM_WORLD);
            MPI_Send(&numbers[(i - 1) * elements_per_rank + (i <= remainder ? i - 1 : remainder)], send_count, MPI_DOUBLE, i, 0, MPI_COMM_WORLD);
        }

        double total_sum = 0.0;
        double largest_positive = 0.0;
        double largest_negative = 0.0;

        // Receiving statistics from other ranks and consolidate
        for (int i = 1; i < size; i++) {
            double recv_total;
            double recv_average;
            double recv_largest_positive;
            double recv_largest_negative;

            MPI_Recv(&recv_total, 1, MPI_DOUBLE, i, 0, MPI_COMM_WORLD, &status);
            MPI_Recv(&recv_average, 1, MPI_DOUBLE, i, 0, MPI_COMM_WORLD, &status);
            MPI_Recv(&recv_largest_positive, 1, MPI_DOUBLE, i, 0, MPI_COMM_WORLD, &status);
            MPI_Recv(&recv_largest_negative, 1, MPI_DOUBLE, i, 0, MPI_COMM_WORLD, &status);

            total_sum += recv_total;
            if (recv_largest_positive > largest_positive) {
                largest_positive = recv_largest_positive;
            }
            if (recv_largest_negative < largest_negative) {
                largest_negative = recv_largest_negative;
            }
        }

        // Printing final statistics
        printf("Total: %lf\n", total_sum);
        printf("Average: %lf\n", total_sum / num_elements);
        printf("Largest positive number: %f\n", largest_positive);
        printf("Largest negative number: %f\n", largest_negative);
     } else {
        // Receiving number of elements from rank 0
        int recv_count;
        MPI_Recv(&recv_count, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, &status);

        // Receiving portion of numbers from rank 0
        double *numbers = (double *) malloc(recv_count * sizeof(double));
        MPI_Recv(numbers, recv_count, MPI_DOUBLE, 0, 0, MPI_COMM_WORLD, &status);

        // Calculating statistics for this rank's portion of numbers
        double total_sum = 0.0;
        double largest_positive = 0.0;
        double largest_negative = 0.0;

        for (int i = 0; i < recv_count; i++) {
            total_sum += numbers[i];
            if (numbers[i] > largest_positive) {
                largest_positive = numbers[i];
            }
            if (numbers[i] < largest_negative) {
                largest_negative = numbers[i];
            }
        }

        double average = total_sum / recv_count;

        // Sending statistics back to rank 0
        MPI_Send(&total_sum, 1, MPI_DOUBLE, 0, 0, MPI_COMM_WORLD);
        MPI_Send(&average, 1, MPI_DOUBLE, 0, 0, MPI_COMM_WORLD);
        MPI_Send(&largest_positive, 1, MPI_DOUBLE, 0, 0, MPI_COMM_WORLD);
        MPI_Send(&largest_negative, 1, MPI_DOUBLE, 0, 0, MPI_COMM_WORLD);
    }

    MPI_Finalize();
    return 0;
}