//computes the sum of the whole numbers from 1 to n
//in this case n is set to 10
@sum
@0
D=A
@sum
M=D

@n
@10
D=A
@n
M=D

@i

@1
D=A

@i
D=M

//start the loop
(LOOP)

@i
D=M+1//D=i+1

@sum
M=D+M//sum = sum+i+1

@i
M=D //save i = i+1
//check if done
@i
D=M

@n
D=D-M;

@LOOP
D;JLT
(END)
@END
0;JMP