class ScreenDisplay{
    width=512;
    height=256;
    _MEMORY_INDEX = 111;
    _ran:RAM;
    /*
     Has the side effect of continuously refreshing a 256
     by 512 black-and-white screen (simulators must
     simulate this device). Each row in the physical
     screen is represented by 32 consecutive 16-bit words,
     starting at the top left corner of the screen. Thus
     the pixel at row r from the top and column c from the
     left (0<=r<=255, 0<=c<=511) reflects the c%16 bit
     (counting from LSB to MSB) of the word found at
     Screen[r*32+c/16].

     */
}