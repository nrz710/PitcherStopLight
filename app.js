"use strict";
/* Leverage Index table by Tom Tango (insidethebook.com/li.shtml), used with attribution.
   Key: inning(1-9) + half(t|b) + bases(1st,2nd,3rd as 0/1) + outs. Values: home run differential -4..+4. */
const LI_TABLE={"1t0000":[0.4,0.6,0.7,0.8,0.9,0,0,0,0],"1t1000":[0.7,0.9,1.1,1.3,1.4,0,0,0,0],"1t0100":[0.6,0.7,0.9,1,1.2,0,0,0,0],"1t0010":[0.5,0.6,0.8,0.9,1,0,0,0,0],"1t1100":[0.8,1.1,1.3,1.6,1.8,0,0,0,0],"1t1010":[0.6,0.8,1.1,1.3,1.5,0,0,0,0],"1t0110":[0.6,0.8,1,1.2,1.3,0,0,0,0],"1t1110":[0.8,1.1,1.4,1.7,2,0,0,0,0],"1t0001":[0.3,0.4,0.5,0.6,0.6,0,0,0,0],"1t1001":[0.6,0.7,0.9,1,1.1,0,0,0,0],"1t0101":[0.6,0.8,0.9,1.1,1.2,0,0,0,0],"1t0011":[0.7,0.9,1,1.2,1.3,0,0,0,0],"1t1101":[0.9,1.2,1.5,1.7,1.9,0,0,0,0],"1t1011":[0.9,1.1,1.3,1.6,1.7,0,0,0,0],"1t0111":[0.7,0.9,1.1,1.3,1.4,0,0,0,0],"1t1111":[1.1,1.5,1.8,2.1,2.4,0,0,0,0],"1t0002":[0.2,0.3,0.3,0.4,0.4,0,0,0,0],"1t1002":[0.4,0.5,0.6,0.7,0.8,0,0,0,0],"1t0102":[0.6,0.7,0.9,1,1.1,0,0,0,0],"1t0012":[0.7,0.9,1,1.2,1.3,0,0,0,0],"1t1102":[0.8,1,1.3,1.5,1.6,0,0,0,0],"1t1012":[0.9,1.1,1.4,1.6,1.7,0,0,0,0],"1t0112":[1,1.2,1.5,1.7,1.9,0,0,0,0],"1t1112":[1.4,1.8,2.1,2.5,2.7,0,0,0,0],"1b0000":[0.7,0.8,0.9,0.9,0.9,0.8,0.6,0.5,0.4],"1b1000":[1.2,1.4,1.5,1.5,1.4,1.2,1,0.8,0.6],"1b0100":[1.1,1.2,1.3,1.2,1.1,1,0.8,0.6,0.5],"1b0010":[1,1.1,1.1,1.1,1,0.8,0.7,0.5,0.4],"1b1100":[1.7,1.9,2,1.9,1.7,1.5,1.2,0.9,0.7],"1b1010":[1.6,1.7,1.7,1.6,1.4,1.2,1,0.7,0.5],"1b0110":[1.4,1.5,1.5,1.4,1.3,1.1,0.9,0.7,0.5],"1b1110":[2.2,2.3,2.3,2.1,1.9,1.6,1.2,0.9,0.7],"1b0001":[0.5,0.6,0.6,0.7,0.6,0.6,0.5,0.4,0.3],"1b1001":[1,1.1,1.2,1.2,1.1,1,0.8,0.7,0.5],"1b0101":[1,1.1,1.2,1.2,1.2,1,0.9,0.7,0.5],"1b0011":[1,1.1,1.3,1.3,1.3,1.1,1,0.8,0.6],"1b1101":[1.7,1.9,2,2,1.8,1.6,1.3,1,0.8],"1b1011":[1.5,1.7,1.8,1.8,1.7,1.5,1.2,1,0.8],"1b0111":[1.4,1.5,1.6,1.5,1.4,1.2,1,0.8,0.6],"1b1111":[2.4,2.6,2.6,2.6,2.3,2,1.6,1.3,1],"1b0002":[0.3,0.4,0.4,0.4,0.4,0.4,0.3,0.3,0.2],"1b1002":[0.6,0.7,0.8,0.8,0.8,0.7,0.6,0.5,0.4],"1b0102":[0.8,1,1.1,1.1,1.1,1,0.8,0.7,0.5],"1b0012":[1,1.1,1.3,1.3,1.3,1.2,1,0.8,0.6],"1b1102":[1.3,1.5,1.6,1.7,1.6,1.4,1.2,0.9,0.7],"1b1012":[1.4,1.6,1.7,1.8,1.7,1.5,1.3,1,0.8],"1b0112":[1.6,1.8,2,2,1.9,1.7,1.4,1.1,0.8],"1b1112":[2.4,2.7,2.9,2.9,2.7,2.4,2,1.5,1.2],"2t0000":[0.4,0.6,0.7,0.8,0.9,1,0.9,0.8,0.7],"2t1000":[0.7,0.9,1.1,1.3,1.5,1.5,1.5,1.4,1.2],"2t0100":[0.5,0.7,0.9,1.1,1.2,1.3,1.3,1.2,1],"2t0010":[0.4,0.6,0.8,0.9,1.1,1.1,1.2,1.1,0.9],"2t1100":[0.8,1.1,1.4,1.6,1.9,2,2,1.9,1.7],"2t1010":[0.6,0.8,1.1,1.3,1.6,1.7,1.8,1.7,1.5],"2t0110":[0.6,0.8,1,1.2,1.4,1.5,1.6,1.5,1.4],"2t1110":[0.8,1.1,1.4,1.7,2,2.3,2.4,2.3,2.1],"2t0001":[0.3,0.4,0.5,0.6,0.7,0.7,0.6,0.6,0.5],"2t1001":[0.6,0.7,0.9,1.1,1.2,1.3,1.2,1.1,0.9],"2t0101":[0.6,0.8,1,1.1,1.2,1.3,1.2,1.1,0.9],"2t0011":[0.7,0.9,1.1,1.2,1.3,1.3,1.3,1.1,0.9],"2t1101":[0.9,1.2,1.5,1.8,2,2.1,2,1.8,1.6],"2t1011":[0.9,1.1,1.4,1.6,1.8,1.8,1.8,1.6,1.4],"2t0111":[0.7,0.9,1.1,1.3,1.5,1.6,1.6,1.5,1.3],"2t1111":[1.1,1.5,1.8,2.2,2.5,2.7,2.7,2.6,2.3],"2t0002":[0.2,0.3,0.3,0.4,0.4,0.4,0.4,0.3,0.3],"2t1002":[0.4,0.5,0.7,0.8,0.8,0.9,0.8,0.7,0.6],"2t0102":[0.6,0.8,0.9,1.1,1.2,1.2,1.1,0.9,0.8],"2t0012":[0.7,0.9,1.1,1.3,1.4,1.4,1.2,1.1,0.9],"2t1102":[0.8,1,1.3,1.5,1.7,1.7,1.6,1.4,1.2],"2t1012":[0.9,1.1,1.4,1.6,1.8,1.8,1.7,1.5,1.3],"2t0112":[1,1.2,1.5,1.8,2,2.1,2,1.7,1.4],"2t1112":[1.3,1.7,2.2,2.6,2.9,3,2.9,2.6,2.2],"2b0000":[0.8,0.9,1,1,0.9,0.8,0.6,0.5,0.4],"2b1000":[1.3,1.5,1.6,1.6,1.5,1.2,1,0.8,0.6],"2b0100":[1.1,1.3,1.3,1.3,1.2,1,0.8,0.6,0.4],"2b0010":[1,1.2,1.2,1.2,1,0.9,0.7,0.5,0.4],"2b1100":[1.8,2,2.1,2,1.8,1.5,1.2,0.9,0.7],"2b1010":[1.6,1.8,1.8,1.7,1.5,1.2,0.9,0.7,0.5],"2b0110":[1.5,1.6,1.6,1.5,1.3,1.1,0.9,0.7,0.5],"2b1110":[2.3,2.4,2.4,2.2,1.9,1.6,1.2,0.9,0.6],"2b0001":[0.5,0.6,0.7,0.7,0.7,0.6,0.5,0.4,0.3],"2b1001":[1,1.2,1.3,1.3,1.2,1,0.8,0.6,0.5],"2b0101":[1,1.2,1.3,1.3,1.2,1.1,0.9,0.7,0.5],"2b0011":[1,1.2,1.3,1.4,1.4,1.2,1,0.8,0.6],"2b1101":[1.7,2,2.1,2.1,2,1.7,1.3,1,0.7],"2b1011":[1.5,1.8,1.9,1.9,1.8,1.6,1.3,1,0.7],"2b0111":[1.4,1.6,1.7,1.6,1.5,1.3,1,0.8,0.6],"2b1111":[2.5,2.7,2.8,2.7,2.4,2.1,1.7,1.3,0.9],"2b0002":[0.3,0.4,0.4,0.5,0.4,0.4,0.3,0.2,0.2],"2b1002":[0.6,0.8,0.9,0.9,0.8,0.7,0.6,0.5,0.3],"2b0102":[0.8,1,1.2,1.2,1.2,1,0.9,0.7,0.5],"2b0012":[1,1.2,1.3,1.4,1.4,1.2,1,0.8,0.6],"2b1102":[1.3,1.6,1.8,1.8,1.7,1.5,1.2,0.9,0.7],"2b1012":[1.4,1.7,1.9,1.9,1.8,1.6,1.3,1,0.7],"2b0112":[1.6,1.9,2.1,2.1,2,1.7,1.4,1.1,0.8],"2b1112":[2.5,2.8,3.1,3.1,2.9,2.5,2,1.5,1.1],"3t0000":[0.4,0.6,0.7,0.9,1,1,1,0.9,0.7],"3t1000":[0.6,0.9,1.1,1.4,1.6,1.7,1.6,1.4,1.2],"3t0100":[0.5,0.7,0.9,1.1,1.3,1.4,1.4,1.2,1],"3t0010":[0.4,0.6,0.8,1,1.1,1.2,1.2,1.1,1],"3t1100":[0.8,1,1.4,1.7,2,2.2,2.1,2,1.7],"3t1010":[0.6,0.8,1.1,1.4,1.6,1.8,1.9,1.8,1.6],"3t0110":[0.5,0.8,1,1.2,1.5,1.6,1.7,1.6,1.4],"3t1110":[0.7,1,1.4,1.8,2.1,2.4,2.6,2.5,2.3],"3t0001":[0.3,0.4,0.5,0.6,0.7,0.7,0.7,0.6,0.5],"3t1001":[0.5,0.7,1,1.2,1.3,1.4,1.3,1.1,0.9],"3t0101":[0.6,0.8,1,1.2,1.3,1.4,1.3,1.1,0.9],"3t0011":[0.6,0.9,1.1,1.3,1.5,1.5,1.3,1.1,0.9],"3t1101":[0.9,1.2,1.5,1.8,2.1,2.2,2.1,1.9,1.6],"3t1011":[0.8,1.1,1.4,1.7,1.9,2,1.9,1.7,1.5],"3t0111":[0.7,0.9,1.2,1.4,1.6,1.7,1.7,1.6,1.3],"3t1111":[1.1,1.4,1.9,2.3,2.7,2.9,2.9,2.7,2.4],"3t0002":[0.2,0.3,0.4,0.4,0.5,0.5,0.4,0.4,0.3],"3t1002":[0.4,0.5,0.7,0.8,0.9,0.9,0.8,0.7,0.6],"3t0102":[0.6,0.8,1,1.1,1.3,1.3,1.1,1,0.8],"3t0012":[0.7,0.9,1.1,1.3,1.5,1.5,1.3,1.1,0.9],"3t1102":[0.8,1,1.3,1.6,1.8,1.9,1.8,1.5,1.2],"3t1012":[0.8,1.1,1.4,1.7,1.9,2,1.9,1.6,1.3],"3t0112":[0.9,1.2,1.6,1.9,2.2,2.2,2.1,1.8,1.5],"3t1112":[1.3,1.7,2.2,2.7,3.1,3.3,3.1,2.7,2.3],"3b0000":[0.8,0.9,1,1.1,1,0.8,0.6,0.5,0.3],"3b1000":[1.3,1.6,1.7,1.7,1.5,1.3,1,0.7,0.5],"3b0100":[1.2,1.3,1.5,1.4,1.3,1.1,0.8,0.6,0.4],"3b0010":[1.1,1.2,1.3,1.2,1.1,0.9,0.7,0.5,0.3],"3b1100":[1.9,2.1,2.3,2.2,1.9,1.6,1.2,0.9,0.6],"3b1010":[1.7,1.9,2,1.8,1.5,1.2,0.9,0.7,0.4],"3b0110":[1.6,1.7,1.8,1.6,1.4,1.1,0.9,0.6,0.4],"3b1110":[2.4,2.6,2.6,2.4,2,1.6,1.2,0.8,0.6],"3b0001":[0.5,0.7,0.7,0.8,0.7,0.6,0.5,0.4,0.3],"3b1001":[1,1.2,1.4,1.4,1.3,1.1,0.8,0.6,0.4],"3b0101":[1,1.3,1.4,1.4,1.3,1.1,0.9,0.6,0.5],"3b0011":[1,1.3,1.4,1.5,1.5,1.3,1,0.7,0.5],"3b1101":[1.8,2.1,2.3,2.3,2.1,1.7,1.3,1,0.7],"3b1011":[1.6,1.9,2,2.1,1.9,1.6,1.3,0.9,0.7],"3b0111":[1.5,1.7,1.8,1.7,1.6,1.3,1,0.8,0.5],"3b1111":[2.6,2.9,3.1,2.9,2.6,2.1,1.6,1.2,0.8],"3b0002":[0.3,0.4,0.5,0.5,0.5,0.4,0.3,0.2,0.2],"3b1002":[0.6,0.8,0.9,1,0.9,0.8,0.6,0.5,0.3],"3b0102":[0.9,1.1,1.3,1.3,1.3,1.1,0.9,0.6,0.5],"3b0012":[1,1.2,1.4,1.6,1.5,1.3,1,0.8,0.5],"3b1102":[1.4,1.7,1.9,2,1.8,1.5,1.2,0.9,0.6],"3b1012":[1.4,1.8,2,2.1,1.9,1.6,1.3,1,0.7],"3b0112":[1.6,2,2.3,2.3,2.2,1.8,1.4,1,0.7],"3b1112":[2.5,3,3.3,3.4,3.1,2.5,2,1.5,1],"4t0000":[0.4,0.5,0.7,0.9,1.1,1.1,1.1,0.9,0.7],"4t1000":[0.6,0.8,1.1,1.4,1.7,1.8,1.7,1.5,1.2],"4t0100":[0.5,0.7,0.9,1.2,1.4,1.5,1.5,1.3,1.1],"4t0010":[0.4,0.6,0.8,1,1.2,1.3,1.3,1.2,1],"4t1100":[0.7,1,1.4,1.8,2.1,2.3,2.3,2.1,1.8],"4t1010":[0.5,0.8,1,1.4,1.7,2,2.1,1.9,1.7],"4t0110":[0.5,0.7,1,1.3,1.6,1.8,1.8,1.7,1.5],"4t1110":[0.7,1,1.4,1.8,2.2,2.6,2.8,2.7,2.4],"4t0001":[0.3,0.4,0.5,0.7,0.8,0.8,0.7,0.6,0.5],"4t1001":[0.5,0.7,1,1.2,1.4,1.5,1.4,1.2,0.9],"4t0101":[0.5,0.7,1,1.2,1.5,1.5,1.4,1.2,0.9],"4t0011":[0.6,0.9,1.1,1.4,1.6,1.6,1.4,1.2,0.9],"4t1101":[0.8,1.1,1.5,1.9,2.3,2.4,2.3,2,1.6],"4t1011":[0.8,1.1,1.4,1.8,2.1,2.2,2.1,1.8,1.5],"4t0111":[0.6,0.9,1.2,1.5,1.7,1.9,1.9,1.7,1.4],"4t1111":[1,1.4,1.9,2.4,2.9,3.1,3.2,2.9,2.4],"4t0002":[0.2,0.3,0.4,0.5,0.5,0.5,0.5,0.4,0.3],"4t1002":[0.4,0.5,0.7,0.9,1,1,0.9,0.7,0.6],"4t0102":[0.5,0.7,1,1.2,1.4,1.4,1.2,1,0.7],"4t0012":[0.6,0.9,1.2,1.4,1.6,1.6,1.4,1.1,0.8],"4t1102":[0.7,1,1.4,1.7,2,2.1,1.9,1.6,1.2],"4t1012":[0.8,1.1,1.5,1.8,2.1,2.2,2,1.7,1.3],"4t0112":[0.9,1.2,1.6,2,2.4,2.5,2.3,1.9,1.5],"4t1112":[1.2,1.7,2.3,2.9,3.4,3.6,3.4,2.9,2.3],"4b0000":[0.8,1,1.1,1.2,1.1,0.9,0.6,0.4,0.3],"4b1000":[1.4,1.7,1.9,1.9,1.7,1.3,1,0.7,0.5],"4b0100":[1.2,1.4,1.6,1.6,1.4,1.1,0.8,0.5,0.4],"4b0010":[1.1,1.3,1.4,1.4,1.1,0.9,0.6,0.4,0.3],"4b1100":[2,2.3,2.5,2.4,2,1.6,1.1,0.8,0.5],"4b1010":[1.8,2.1,2.1,2,1.6,1.2,0.9,0.6,0.4],"4b0110":[1.7,1.9,1.9,1.8,1.5,1.1,0.8,0.6,0.4],"4b1110":[2.6,2.8,2.8,2.6,2.1,1.6,1.1,0.8,0.5],"4b0001":[0.5,0.7,0.8,0.9,0.8,0.6,0.5,0.3,0.2],"4b1001":[1,1.3,1.5,1.6,1.4,1.1,0.8,0.6,0.4],"4b0101":[1.1,1.3,1.5,1.6,1.4,1.2,0.9,0.6,0.4],"4b0011":[1,1.3,1.6,1.7,1.6,1.3,1,0.7,0.5],"4b1101":[1.8,2.2,2.5,2.5,2.2,1.8,1.3,0.9,0.6],"4b1011":[1.7,2,2.2,2.3,2.1,1.7,1.3,0.9,0.6],"4b0111":[1.6,1.8,2,1.9,1.7,1.4,1,0.7,0.5],"4b1111":[2.7,3.2,3.3,3.2,2.8,2.2,1.6,1.1,0.7],"4b0002":[0.3,0.4,0.5,0.6,0.5,0.4,0.3,0.2,0.2],"4b1002":[0.7,0.8,1,1.1,1,0.8,0.6,0.4,0.3],"4b0102":[0.9,1.1,1.4,1.5,1.4,1.1,0.9,0.6,0.4],"4b0012":[1,1.3,1.6,1.7,1.6,1.3,1,0.7,0.5],"4b1102":[1.4,1.8,2.1,2.2,2,1.6,1.2,0.8,0.6],"4b1012":[1.5,1.9,2.2,2.3,2.1,1.7,1.3,0.9,0.6],"4b0112":[1.7,2.1,2.5,2.6,2.3,1.9,1.4,1,0.7],"4b1112":[2.6,3.2,3.6,3.7,3.3,2.6,1.9,1.4,0.9],"5t0000":[0.4,0.5,0.7,1,1.2,1.3,1.1,0.9,0.7],"5t1000":[0.5,0.8,1.1,1.5,1.9,2,1.9,1.6,1.2],"5t0100":[0.4,0.6,0.9,1.2,1.5,1.7,1.6,1.4,1.1],"5t0010":[0.3,0.5,0.7,1,1.3,1.5,1.5,1.3,1.1],"5t1100":[0.6,0.9,1.3,1.8,2.3,2.6,2.5,2.3,1.8],"5t1010":[0.5,0.7,1,1.4,1.8,2.2,2.3,2.1,1.7],"5t0110":[0.4,0.7,1,1.3,1.7,1.9,2,1.9,1.6],"5t1110":[0.6,0.9,1.3,1.8,2.4,2.8,3,2.9,2.5],"5t0001":[0.3,0.4,0.6,0.7,0.9,0.9,0.8,0.6,0.5],"5t1001":[0.5,0.7,1,1.3,1.6,1.7,1.5,1.2,0.9],"5t0101":[0.5,0.7,1,1.3,1.6,1.7,1.5,1.2,0.9],"5t0011":[0.6,0.8,1.1,1.5,1.8,1.8,1.5,1.2,0.9],"5t1101":[0.7,1.1,1.5,2,2.5,2.7,2.5,2.1,1.6],"5t1011":[0.7,1,1.4,1.9,2.3,2.4,2.3,1.9,1.5],"5t0111":[0.6,0.8,1.2,1.5,1.9,2.1,2.1,1.8,1.4],"5t1111":[0.9,1.3,1.9,2.5,3.1,3.5,3.5,3.1,2.5],"5t0002":[0.2,0.3,0.4,0.5,0.6,0.6,0.5,0.4,0.3],"5t1002":[0.3,0.5,0.7,0.9,1.1,1.1,1,0.8,0.6],"5t0102":[0.5,0.7,1,1.3,1.6,1.6,1.3,1,0.7],"5t0012":[0.6,0.8,1.2,1.5,1.8,1.8,1.5,1.1,0.8],"5t1102":[0.7,1,1.4,1.8,2.2,2.3,2.1,1.6,1.2],"5t1012":[0.7,1.1,1.5,1.9,2.4,2.5,2.2,1.7,1.3],"5t0112":[0.8,1.1,1.6,2.1,2.6,2.8,2.5,2,1.4],"5t1112":[1.1,1.6,2.2,3,3.7,4,3.7,3,2.3],"5b0000":[0.8,1.1,1.3,1.3,1.2,0.9,0.6,0.4,0.3],"5b1000":[1.4,1.8,2.1,2.1,1.8,1.3,0.9,0.6,0.4],"5b0100":[1.2,1.6,1.8,1.8,1.5,1.1,0.7,0.5,0.3],"5b0010":[1.2,1.5,1.6,1.5,1.2,0.9,0.6,0.4,0.2],"5b1100":[2.1,2.5,2.7,2.6,2.2,1.6,1.1,0.7,0.4],"5b1010":[1.9,2.3,2.4,2.2,1.7,1.2,0.8,0.5,0.3],"5b0110":[1.8,2.1,2.1,2,1.6,1.1,0.8,0.5,0.3],"5b1110":[2.8,3.1,3.1,2.8,2.2,1.5,1,0.7,0.4],"5b0001":[0.5,0.7,0.9,1,0.9,0.7,0.5,0.3,0.2],"5b1001":[1.1,1.4,1.7,1.8,1.5,1.2,0.8,0.5,0.3],"5b0101":[1.1,1.4,1.7,1.8,1.6,1.2,0.8,0.5,0.3],"5b0011":[1,1.4,1.7,2,1.8,1.4,1,0.6,0.4],"5b1101":[1.9,2.4,2.8,2.8,2.4,1.8,1.2,0.8,0.5],"5b1011":[1.7,2.2,2.5,2.6,2.3,1.7,1.2,0.8,0.5],"5b0111":[1.6,2,2.2,2.1,1.9,1.4,1,0.6,0.4],"5b1111":[2.9,3.4,3.7,3.5,3,2.2,1.5,1,0.6],"5b0002":[0.3,0.4,0.6,0.6,0.6,0.4,0.3,0.2,0.1],"5b1002":[0.6,0.9,1.1,1.2,1.1,0.8,0.6,0.4,0.2],"5b0102":[0.8,1.2,1.5,1.7,1.6,1.2,0.8,0.6,0.4],"5b0012":[0.9,1.3,1.7,2,1.9,1.4,1,0.7,0.4],"5b1102":[1.4,1.9,2.3,2.5,2.2,1.6,1.1,0.8,0.5],"5b1012":[1.5,2,2.4,2.6,2.4,1.8,1.2,0.8,0.5],"5b0112":[1.7,2.3,2.8,3,2.6,1.9,1.3,0.9,0.6],"5b1112":[2.7,3.4,4,4.2,3.6,2.7,1.8,1.2,0.8],"6t0000":[0.3,0.5,0.7,1,1.3,1.4,1.3,1,0.7],"6t1000":[0.5,0.7,1.1,1.6,2.1,2.3,2.1,1.7,1.2],"6t0100":[0.4,0.6,0.9,1.3,1.7,1.9,1.8,1.5,1.1],"6t0010":[0.3,0.5,0.7,1,1.4,1.7,1.7,1.4,1.1],"6t1100":[0.5,0.8,1.3,1.8,2.5,2.9,2.8,2.4,1.9],"6t1010":[0.4,0.6,0.9,1.4,1.9,2.4,2.6,2.3,1.8],"6t0110":[0.4,0.6,0.9,1.3,1.8,2.2,2.3,2.1,1.7],"6t1110":[0.5,0.8,1.2,1.8,2.5,3.1,3.4,3.2,2.7],"6t0001":[0.2,0.4,0.5,0.8,1,1.1,0.9,0.7,0.4],"6t1001":[0.4,0.6,0.9,1.3,1.8,1.9,1.7,1.3,0.9],"6t0101":[0.4,0.6,1,1.4,1.8,2,1.7,1.3,0.9],"6t0011":[0.5,0.8,1.1,1.6,2,2.1,1.6,1.3,0.9],"6t1101":[0.6,1,1.5,2.1,2.8,3.1,2.8,2.2,1.6],"6t1011":[0.6,0.9,1.4,2,2.6,2.8,2.5,2.1,1.5],"6t0111":[0.5,0.8,1.1,1.6,2.1,2.3,2.3,1.9,1.5],"6t1111":[0.8,1.2,1.8,2.6,3.4,3.9,3.9,3.3,2.6],"6t0002":[0.2,0.3,0.4,0.5,0.7,0.7,0.5,0.4,0.2],"6t1002":[0.3,0.5,0.7,1,1.3,1.3,1.1,0.8,0.5],"6t0102":[0.4,0.7,1,1.4,1.8,1.8,1.4,1,0.7],"6t0012":[0.5,0.8,1.2,1.6,2.1,2.1,1.6,1.1,0.7],"6t1102":[0.6,0.9,1.3,1.9,2.5,2.6,2.3,1.7,1.1],"6t1012":[0.6,1,1.4,2,2.7,2.8,2.4,1.8,1.2],"6t0112":[0.7,1,1.6,2.2,2.9,3.2,2.7,2,1.4],"6t1112":[0.9,1.4,2.2,3.1,4.1,4.5,4.1,3.2,2.3],"6b0000":[0.8,1.1,1.4,1.6,1.3,0.9,0.6,0.3,0.2],"6b1000":[1.4,1.9,2.3,2.4,2,1.3,0.8,0.5,0.3],"6b0100":[1.3,1.7,2,2,1.6,1.1,0.7,0.4,0.2],"6b0010":[1.2,1.6,1.8,1.7,1.3,0.8,0.5,0.3,0.2],"6b1100":[2.2,2.7,3.1,3,2.3,1.5,0.9,0.6,0.3],"6b1010":[2,2.5,2.7,2.4,1.7,1.1,0.7,0.4,0.2],"6b0110":[1.9,2.3,2.4,2.2,1.7,1.1,0.7,0.4,0.2],"6b1110":[3,3.5,3.6,3.1,2.2,1.4,0.9,0.5,0.3],"6b0001":[0.5,0.8,1,1.2,1,0.7,0.4,0.3,0.2],"6b1001":[1,1.5,1.9,2.1,1.7,1.1,0.7,0.4,0.3],"6b0101":[1.1,1.5,1.9,2.1,1.8,1.2,0.8,0.5,0.3],"6b0011":[1,1.4,1.9,2.3,2.1,1.4,0.9,0.5,0.3],"6b1101":[1.9,2.6,3.1,3.3,2.7,1.8,1.1,0.7,0.4],"6b1011":[1.8,2.4,2.8,3,2.6,1.7,1.1,0.7,0.4],"6b0111":[1.7,2.2,2.5,2.5,2.1,1.4,0.9,0.5,0.3],"6b1111":[3,3.8,4.2,4,3.3,2.2,1.4,0.8,0.5],"6b0002":[0.3,0.4,0.6,0.8,0.7,0.5,0.3,0.2,0.1],"6b1002":[0.6,0.9,1.2,1.5,1.3,0.8,0.5,0.3,0.2],"6b0102":[0.8,1.2,1.6,2,1.8,1.2,0.8,0.5,0.3],"6b0012":[0.9,1.3,1.9,2.4,2.2,1.4,0.9,0.6,0.3],"6b1102":[1.4,2,2.6,2.9,2.5,1.6,1,0.6,0.4],"6b1012":[1.4,2.1,2.7,3.1,2.7,1.8,1.1,0.7,0.4],"6b0112":[1.6,2.4,3.1,3.5,2.9,1.9,1.2,0.7,0.4],"6b1112":[2.7,3.7,4.5,4.9,4,2.6,1.7,1,0.6],"7t0000":[0.2,0.4,0.7,1,1.5,1.7,1.4,1,0.6],"7t1000":[0.4,0.6,1,1.6,2.4,2.7,2.3,1.7,1.2],"7t0100":[0.3,0.5,0.8,1.2,1.9,2.3,2,1.5,1.1],"7t0010":[0.2,0.4,0.6,1,1.5,2,1.9,1.5,1.1],"7t1100":[0.4,0.7,1.1,1.8,2.7,3.4,3.2,2.6,1.9],"7t1010":[0.3,0.5,0.8,1.3,2,2.8,3,2.5,1.8],"7t0110":[0.3,0.5,0.8,1.3,2,2.5,2.6,2.3,1.7],"7t1110":[0.4,0.6,1.1,1.7,2.6,3.5,3.9,3.6,2.8],"7t0001":[0.2,0.3,0.5,0.8,1.2,1.3,1,0.6,0.4],"7t1001":[0.3,0.5,0.9,1.4,2,2.3,1.8,1.3,0.8],"7t0101":[0.3,0.6,0.9,1.4,2.1,2.3,1.8,1.3,0.8],"7t0011":[0.4,0.7,1.1,1.6,2.4,2.5,1.8,1.3,0.8],"7t1101":[0.5,0.8,1.3,2.1,3.2,3.6,3.1,2.3,1.6],"7t1011":[0.5,0.8,1.3,2,3.1,3.3,2.9,2.2,1.5],"7t0111":[0.4,0.7,1.1,1.6,2.5,2.8,2.7,2.1,1.4],"7t1111":[0.6,1,1.6,2.6,3.9,4.5,4.4,3.6,2.6],"7t0002":[0.1,0.2,0.4,0.5,0.8,0.8,0.6,0.3,0.2],"7t1002":[0.2,0.4,0.6,1,1.5,1.6,1.2,0.7,0.4],"7t0102":[0.3,0.6,0.9,1.4,2.1,2.2,1.5,0.9,0.6],"7t0012":[0.4,0.7,1.1,1.7,2.5,2.5,1.7,1.1,0.6],"7t1102":[0.4,0.8,1.2,1.9,2.9,3.2,2.5,1.7,1],"7t1012":[0.5,0.8,1.4,2.1,3.1,3.4,2.6,1.7,1.1],"7t0112":[0.5,0.9,1.5,2.3,3.4,3.9,3.1,2,1.2],"7t1112":[0.7,1.2,2,3.1,4.7,5.4,4.5,3.3,2.1],"7b0000":[0.8,1.2,1.6,1.9,1.5,0.8,0.4,0.2,0.1],"7b1000":[1.4,2,2.6,3,2.3,1.2,0.7,0.4,0.2],"7b0100":[1.3,1.8,2.3,2.4,1.8,0.9,0.5,0.3,0.1],"7b0010":[1.3,1.8,2.2,2,1.5,0.8,0.4,0.2,0.1],"7b1100":[2.2,3,3.6,3.5,2.5,1.3,0.8,0.4,0.2],"7b1010":[2.1,2.8,3.3,2.8,1.7,0.9,0.5,0.3,0.1],"7b0110":[2,2.6,2.9,2.6,1.7,0.9,0.5,0.3,0.1],"7b1110":[3.3,4,4.1,3.5,2.3,1.2,0.7,0.4,0.2],"7b0001":[0.5,0.8,1.1,1.4,1.2,0.6,0.3,0.2,0.1],"7b1001":[1,1.5,2.1,2.5,2,1.1,0.6,0.3,0.2],"7b0101":[1,1.5,2.1,2.6,2.1,1.1,0.6,0.3,0.2],"7b0011":[1,1.5,2.1,2.9,2.5,1.3,0.7,0.4,0.2],"7b1101":[1.9,2.7,3.6,4,3,1.6,0.9,0.5,0.3],"7b1011":[1.8,2.6,3.2,3.7,3.1,1.6,0.9,0.5,0.3],"7b0111":[1.7,2.4,3,3,2.5,1.3,0.7,0.4,0.2],"7b1111":[3.1,4.2,4.9,4.8,3.7,2,1.1,0.6,0.3],"7b0002":[0.2,0.4,0.7,1,0.8,0.4,0.2,0.1,0.1],"7b1002":[0.5,0.9,1.4,1.8,1.5,0.8,0.4,0.2,0.1],"7b0102":[0.7,1.1,1.8,2.6,2.2,1.1,0.7,0.4,0.2],"7b0012":[0.8,1.3,2,3,2.6,1.4,0.8,0.4,0.2],"7b1102":[1.2,2,2.9,3.6,2.9,1.5,0.8,0.5,0.2],"7b1012":[1.3,2.1,3,3.8,3.1,1.6,0.9,0.5,0.3],"7b0112":[1.5,2.4,3.6,4.3,3.3,1.7,1,0.5,0.3],"7b1112":[2.6,3.9,5.2,5.9,4.5,2.4,1.3,0.7,0.4],"8t0000":[0.2,0.3,0.6,1,1.9,2.2,1.5,0.9,0.6],"8t1000":[0.2,0.4,0.8,1.5,2.8,3.4,2.6,1.7,1],"8t0100":[0.2,0.4,0.6,1.1,2.2,2.8,2.3,1.6,1],"8t0010":[0.2,0.3,0.5,0.9,1.8,2.4,2.3,1.6,1],"8t1100":[0.3,0.5,0.9,1.6,3.1,4.1,3.7,2.8,1.8],"8t1010":[0.2,0.3,0.6,1.1,2.1,3.3,3.6,2.8,1.8],"8t0110":[0.2,0.3,0.6,1.1,2.1,3.1,3.2,2.6,1.7],"8t1110":[0.2,0.4,0.8,1.5,2.8,4.1,4.6,4,3],"8t0001":[0.1,0.2,0.4,0.7,1.4,1.6,1,0.6,0.3],"8t1001":[0.2,0.4,0.7,1.3,2.4,2.9,2,1.2,0.7],"8t0101":[0.2,0.4,0.8,1.3,2.5,2.9,2,1.2,0.7],"8t0011":[0.3,0.5,0.9,1.6,3.1,3.2,2,1.3,0.7],"8t1101":[0.3,0.6,1.1,2,3.7,4.5,3.5,2.4,1.4],"8t1011":[0.3,0.6,1.1,2,3.8,4.2,3.3,2.3,1.4],"8t0111":[0.3,0.5,0.9,1.6,3,3.4,3.2,2.2,1.3],"8t1111":[0.4,0.7,1.4,2.4,4.6,5.6,5.2,3.9,2.6],"8t0002":[0.1,0.2,0.3,0.5,1,1.1,0.6,0.3,0.1],"8t1002":[0.2,0.3,0.5,1,1.8,2.1,1.3,0.7,0.3],"8t0102":[0.2,0.4,0.8,1.4,2.7,2.8,1.5,0.8,0.4],"8t0012":[0.3,0.5,0.9,1.6,3.2,3.3,1.7,0.9,0.4],"8t1102":[0.3,0.6,1,1.8,3.5,4,2.7,1.6,0.8],"8t1012":[0.3,0.6,1.1,2,3.8,4.3,2.8,1.6,0.8],"8t0112":[0.3,0.7,1.2,2.1,4,4.9,3.5,1.9,1],"8t1112":[0.5,0.9,1.6,2.9,5.6,6.8,5.1,3.3,1.9],"8b0000":[0.7,1.1,1.8,2.5,1.8,0.6,0.3,0.1,0.1],"8b1000":[1.3,2.1,3.1,3.8,2.6,0.9,0.4,0.2,0.1],"8b0100":[1.2,1.9,2.7,3.1,2,0.7,0.3,0.1,0.1],"8b0010":[1.2,1.9,2.7,2.5,1.7,0.6,0.3,0.1,0.1],"8b1100":[2.2,3.3,4.2,4.4,2.8,0.9,0.4,0.2,0.1],"8b1010":[2.2,3.2,4.1,3.3,1.8,0.6,0.3,0.1,0.1],"8b0110":[2.1,3,3.6,3.3,1.8,0.6,0.3,0.1,0.1],"8b1110":[3.5,4.6,5,4.2,2.2,0.8,0.4,0.2,0.1],"8b0001":[0.4,0.7,1.2,1.9,1.4,0.5,0.2,0.1,0],"8b1001":[0.8,1.5,2.4,3.4,2.4,0.8,0.4,0.2,0.1],"8b0101":[0.8,1.5,2.4,3.4,2.5,0.8,0.4,0.2,0.1],"8b0011":[0.9,1.5,2.4,3.9,3.2,1,0.5,0.2,0.1],"8b1101":[1.7,2.9,4.1,5.1,3.5,1.1,0.5,0.3,0.1],"8b1011":[1.7,2.7,3.9,4.9,3.8,1.2,0.6,0.3,0.1],"8b0111":[1.6,2.6,3.7,4,3,0.9,0.4,0.2,0.1],"8b1111":[3.1,4.6,5.9,6.2,4.4,1.4,0.7,0.3,0.1],"8b0002":[0.2,0.4,0.7,1.3,1.1,0.3,0.2,0.1,0],"8b1002":[0.4,0.8,1.6,2.5,1.8,0.6,0.3,0.1,0.1],"8b0102":[0.5,1,1.9,3.5,2.8,0.9,0.4,0.2,0.1],"8b0012":[0.5,1.1,2.1,4.1,3.4,1,0.5,0.2,0.1],"8b1102":[1,2,3.3,4.7,3.5,1.1,0.5,0.2,0.1],"8b1012":[1,2,3.4,5.1,3.8,1.2,0.6,0.3,0.1],"8b0112":[1.2,2.3,4.2,5.8,3.9,1.3,0.6,0.3,0.1],"8b1112":[2.3,4,6.1,7.7,5.3,1.7,0.8,0.4,0.2],"9t0000":[0.1,0.2,0.3,0.7,2.4,2.9,1.6,0.8,0.4],"9t1000":[0.1,0.2,0.5,1.1,3.4,4.6,2.9,1.6,0.8],"9t0100":[0.1,0.2,0.4,0.8,2.6,3.7,2.7,1.5,0.8],"9t0010":[0.1,0.2,0.3,0.7,2.3,3.1,2.9,1.6,0.8],"9t1100":[0.1,0.3,0.6,1.2,3.6,5.3,4.4,2.9,1.6],"9t1010":[0.1,0.2,0.4,0.8,2.3,4.2,4.6,3,1.7],"9t0110":[0.1,0.2,0.4,0.8,2.4,4,4,2.9,1.6],"9t1110":[0.1,0.2,0.5,1,2.9,5.2,5.7,4.6,3.1],"9t0001":[0.1,0.1,0.3,0.6,1.9,2.2,1,0.5,0.2],"9t1001":[0.1,0.2,0.5,1,3.1,3.9,2.2,1,0.4],"9t0101":[0.1,0.2,0.5,1,3.3,4,2.2,1,0.5],"9t0011":[0.1,0.3,0.6,1.2,4.3,4.4,2.3,1.1,0.5],"9t1101":[0.1,0.3,0.7,1.4,4.6,6.1,4,2.3,1.1],"9t1011":[0.1,0.3,0.7,1.5,5,5.7,4,2.3,1.1],"9t0111":[0.1,0.3,0.6,1.2,3.9,4.6,3.9,2.3,1.1],"9t1111":[0.2,0.4,0.8,1.8,5.7,7.3,6.2,4.2,2.4],"9t0002":[0,0.1,0.2,0.4,1.4,1.5,0.5,0.2,0.1],"9t1002":[0.1,0.2,0.3,0.7,2.4,2.9,1.3,0.4,0.1],"9t0102":[0.1,0.2,0.5,1.1,3.7,4,1.4,0.5,0.2],"9t0012":[0.1,0.3,0.6,1.3,4.4,4.6,1.4,0.5,0.2],"9t1102":[0.1,0.3,0.7,1.4,4.5,5.5,2.9,1.3,0.4],"9t1012":[0.2,0.3,0.7,1.5,5,5.9,2.9,1.3,0.4],"9t0112":[0.2,0.3,0.7,1.6,5.1,6.9,3.9,1.4,0.5],"9t1112":[0.2,0.5,1,2.1,6.9,9.1,5.7,3.1,1.4],"9b0000":[0.5,1,2,3.6,2.3,0,0,0,0],"9b1000":[1,2,3.6,5.4,3.1,0,0,0,0],"9b0100":[1,1.9,3.3,4.3,2.5,0,0,0,0],"9b0010":[1.1,2,3.6,3.5,2.1,0,0,0,0],"9b1100":[2,3.6,5.2,6,3.2,0,0,0,0],"9b1010":[2.1,3.7,5.5,4.3,2.1,0,0,0,0],"9b0110":[2,3.5,4.7,4.3,2,0,0,0,0],"9b1110":[3.7,5.4,6.4,5.3,2.4,0,0,0,0],"9b0001":[0.2,0.6,1.3,2.8,1.9,0,0,0,0],"9b1001":[0.6,1.3,2.8,4.8,3,0,0,0,0],"9b0101":[0.6,1.3,2.7,5,3.2,0,0,0,0],"9b0011":[0.6,1.4,2.9,5.8,4.5,0,0,0,0],"9b1101":[1.3,2.9,4.8,7.2,4.3,0,0,0,0],"9b1011":[1.4,2.9,4.9,7.1,5,0,0,0,0],"9b0111":[1.4,2.8,4.8,5.7,4,0,0,0,0],"9b1111":[3,5.1,7.3,8.6,5.4,0,0,0,0],"9b0002":[0.1,0.2,0.6,1.9,1.5,0,0,0,0],"9b1002":[0.2,0.5,1.7,3.7,2.4,0,0,0,0],"9b0102":[0.2,0.6,1.8,5.2,3.9,0,0,0,0],"9b0012":[0.2,0.7,1.8,6.1,4.7,0,0,0,0],"9b1102":[0.6,1.7,3.7,6.8,4.4,0,0,0,0],"9b1012":[0.6,1.7,3.7,7.4,5,0,0,0,0],"9b0112":[0.7,1.8,5.1,8.4,4.7,0,0,0,0],"9b1112":[1.8,3.9,7,10.9,6.4,0,0,0,0]};
const MODE=document.body.dataset.mode==='player'?'player':'admin';
const FG_MAP={FF:'FA',FA:'FA',SI:'SI',FT:'SI',FC:'FC',FS:'FS',SF:'FS',FO:'FO',SL:'SL',ST:'SL',SV:'CU',CU:'CU',CS:'CU',KC:'KC',CH:'CH',SC:'CH'};
const FG_LABEL={FA:'Four-seam',SI:'Sinker',FC:'Cutter',FS:'Splitter',SL:'Slider',CU:'Curveball',CH:'Changeup',KC:'Knuckle curve',FO:'Forkball'};
const FASTBALLS=new Set(['FA','SI','FC']);
const SLOTS=[['stf','Stf+ ','stuff'],['loc','Loc+ ','loc'],['pit','Pit+ ','pit']];
const TRAITS=[
  {k:'velo',label:'Velocity',unit:'mph',dec:1,min:0.5},
  {k:'ivb',label:'Induced vert. break',unit:'in',dec:1,min:0.75},
  {k:'hb',label:'Horiz. break (arm +)',unit:'in',dec:1,min:0.75},
  {k:'spin',label:'Spin rate',unit:'rpm',dec:0,min:40},
  {k:'ext',label:'Extension',unit:'ft',dec:2,min:0.1},
  {k:'relZ',label:'Release height',unit:'ft',dec:2,min:0.08},
  {k:'relX',label:'Release side',unit:'ft',dec:2,min:0.08},
  {k:'arm',label:'Arm angle',unit:'°',dec:1,min:1}
];
const OUTS={strikeout:1,field_out:1,force_out:1,sac_fly:1,sac_bunt:1,fielders_choice_out:1,other_out:1,grounded_into_double_play:2,double_play:2,strikeout_double_play:2,sac_fly_double_play:2,sac_bunt_double_play:2,triple_play:3};
const SWING=new Set(['swinging_strike','swinging_strike_blocked','foul','foul_tip','hit_into_play','foul_bunt','missed_bunt','bunt_foul_tip']);
const WHIFF=new Set(['swinging_strike','swinging_strike_blocked','foul_tip','missed_bunt']);

const sources={savant:null,stf:null,loc:null,pit:null};
let M=null, selDate=null;

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function num(v){if(v===undefined||v===null)return null;const s=String(v).trim();if(s===''||s==='NA'||s==='null'||s==='NaN')return null;const x=+s;return Number.isFinite(x)?x:null}
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function sd(a){if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))}
function wmean(pairs){let sw=0,s=0;for(const[v,w]of pairs){if(v==null||!w)continue;sw+=w;s+=v*w}return sw?s/sw:null}
function wcorr(xs,ys,ws){
  const pts=xs.map((x,i)=>[x,ys[i],ws[i]]).filter(p=>p[0]!=null&&p[1]!=null);
  if(pts.length<4)return null;
  const W=pts.reduce((s,p)=>s+p[2],0);
  const mx=pts.reduce((s,p)=>s+p[0]*p[2],0)/W,my=pts.reduce((s,p)=>s+p[1]*p[2],0)/W;
  let sxy=0,sxx=0,syy=0;for(const[x,y,w]of pts){sxy+=w*(x-mx)*(y-my);sxx+=w*(x-mx)**2;syy+=w*(y-my)**2}
  return sxx&&syy?sxy/Math.sqrt(sxx*syy):null;
}
const fmt=(v,d=1)=>v==null?'—':v.toFixed(d);
const pct=(v)=>v==null?'—':Math.round(v*100)+'%';
const woba=v=>v==null?'—':v.toFixed(3).replace(/^0/,'');

function parseCSV(text){
  const r=Papa.parse(text.replace(/^\uFEFF/,''),{header:true,skipEmptyLines:true,transformHeader:h=>h.replace(/^\uFEFF/,'').trim()});
  return {rows:r.data,fields:r.meta.fields||[]};
}
function classify(fields){
  if(fields.includes('pitch_type')&&fields.includes('release_speed'))return 'savant';
  if(fields.some(h=>h.startsWith('Stf+ ')))return 'stf';
  if(fields.some(h=>h.startsWith('Loc+ ')))return 'loc';
  if(fields.some(h=>h.startsWith('Pit+ ')))return 'pit';
  return null;
}

/* ---------- game state at entry ---------- */
const occ=v=>{const s=String(v??'').trim();return s!==''&&s!=='NA'&&s!=='null'&&s!=='NaN'&&s!=='0'};
function leverage(inn,top,b1,b2,b3,outs,homeDiff){
  const k=`${Math.min(Math.max(inn,1),9)}${top?'t':'b'}${+!!b1}${+!!b2}${+!!b3}${outs}`;
  const row=LI_TABLE[k];if(!row)return null;
  return row[Math.max(-4,Math.min(4,homeDiff))+4];
}
function entryState(g){
  const p=g.pitches[0];if(!p)return null;
  const has=p.inn!=null&&p.outs!=null&&p.hs!=null&&p.as!=null;
  const starter=g.gs===1||(g.gs==null&&has&&p.inn===1&&p.outs===0&&!p.b1&&!p.b2&&!p.b3&&p.hs===0&&p.as===0);
  if(!has)return{starter,missing:true};
  const diff=p.fs!=null&&p.bs!=null?p.fs-p.bs:(p.top?p.hs-p.as:p.as-p.hs);
  return{starter,inn:p.inn,top:p.top,outs:p.outs,b1:p.b1,b2:p.b2,b3:p.b3,balls:p.balls??0,strikes:p.strikes??0,diff,
    li:leverage(p.inn,p.top,p.b1,p.b2,p.b3,p.outs,p.hs-p.as),liCap:Math.abs(p.hs-p.as)>4};
}

/* ---------- model ---------- */
function build(){
  const sv=sources.savant.rows;
  const throws=(sv.find(r=>r.p_throws)||{}).p_throws||'L';
  const hbSign=throws==='L'?1:-1;
  const nameRaw=(sv.find(r=>r.player_name)||{}).player_name||'';
  let name=nameRaw.includes(',')?nameRaw.split(',').map(s=>s.trim()).reverse().join(' '):nameRaw;
  const year=(sv.find(r=>r.game_year)||{}).game_year||'';

  const byDate={};const nameCount={};
  for(const r of sv){
    const code=FG_MAP[r.pitch_type];if(!code||!r.game_date)continue;
    const ls=num(r.launch_speed),ew=num(r.estimated_woba_using_speedangle),wv=num(r.woba_value),wd=num(r.woba_denom);
    const zone=num(r.zone),desc=r.description||'';
    const p={code,date:r.game_date,ab:num(r.at_bat_number)||0,pn:num(r.pitch_number)||0,
      velo:num(r.release_speed),ivb:num(r.pfx_z)!=null?num(r.pfx_z)*12:null,hb:num(r.pfx_x)!=null?num(r.pfx_x)*12*hbSign:null,
      spin:num(r.release_spin_rate),ext:num(r.release_extension),relZ:num(r.release_pos_z),relX:num(r.release_pos_x)!=null?Math.abs(num(r.release_pos_x)):null,
      arm:num(r.arm_angle),mx:num(r.pfx_x)!=null?-num(r.pfx_x)*12:null,my:num(r.pfx_z)!=null?num(r.pfx_z)*12:null,desc,swing:SWING.has(desc),whiff:WHIFF.has(desc),csw:desc==='called_strike'||WHIFF.has(desc),
      inZone:zone!=null&&zone>=1&&zone<=9,hasZone:zone!=null,ev:r.events||'',
      wDen:wd,xw:wd===1?((ls!=null&&ew!=null)?ew:wv):null,rv:num(r.delta_pitcher_run_exp),
      runs:(num(r.post_bat_score)!=null&&num(r.bat_score)!=null)?num(r.post_bat_score)-num(r.bat_score):0,
      inn:num(r.inning),top:r.inning_topbot==='Top',outs:num(r.outs_when_up),b1:occ(r.on_1b),b2:occ(r.on_2b),b3:occ(r.on_3b),hs:num(r.home_score),as:num(r.away_score),fs:num(r.fld_score),bs:num(r.bat_score),balls:num(r.balls),strikes:num(r.strikes),
      opp:r.inning_topbot==='Top'?r.away_team:(r.inning_topbot==='Bot'?'@'+r.home_team:''),team:r.inning_topbot==='Top'?r.home_team:(r.inning_topbot==='Bot'?r.away_team:'')};
    (byDate[p.date]||=[]).push(p);
    const k=code+'|'+(r.pitch_name||'');nameCount[k]=(nameCount[k]||0)+1;
  }
  for(const d in byDate)byDate[d].sort((a,b)=>a.ab-b.ab||a.pn-b.pn);

  // FanGraphs merge
  const fg={};let season=null,fgName=null;
  for(const[slot,prefix,key]of SLOTS){
    const src=sources[slot];if(!src)continue;
    const pcols=src.fields.filter(h=>h.startsWith(prefix)).map(h=>[h,h.slice(prefix.length).trim()]);
    for(const r of src.rows){
      const d=String(r.Date||'').trim();
      const isGame=/^\d{4}-\d{2}-\d{2}$/.test(d);
      if(!isGame&&!/total|season|^\d{4}$/i.test(d+String(r.Team||'')))continue;
      const t=isGame?(fg[d]||={date:d,opp:r.Opp,team:r.Team,gs:num(r.GS),overall:{},p:{}}):(season||={overall:{},p:{}});
      fgName=fgName||r.NameASCII||r.Name;
      const o=t.overall;
      o.stuff=num(r['Stuff+'])??o.stuff;o.loc=num(r['Location+'])??o.loc;o.pit=num(r['Pitching+'])??o.pit;
      for(const[h,code]of pcols){const v=num(r[h]);if(v!=null)(t.p[code]||={})[key]=v}
    }
  }
  if(!name&&fgName)name=fgName;

  const dates=[...new Set([...Object.keys(byDate),...Object.keys(fg)])].sort();
  const games=dates.map(d=>{
    const ps=byDate[d]||[];const f=fg[d]||null;
    const byCode={};for(const p of ps)(byCode[p.code]||=[]).push(p);
    const opp=f?.opp||(ps[0]?.opp)||'';
    const g={date:d,opp,gs:f?f.gs:null,fg:f,pitches:ps,byCode};g.entry=entryState(g);return g;
  });

  const lastG=[...games].reverse().find(g=>g.pitches.length||g.fg?.team);
  const team=(lastG?.fg?.team)||(lastG?.pitches.find(p=>p.team)?.team)||'';
  const yrs=[...new Set(dates.map(d=>d.slice(0,4)))].sort();
  const yearRange=yrs.length>1?`${yrs[0]}–${yrs[yrs.length-1]}`:(yrs[0]||String(year));
  // arsenal
  const all=games.flatMap(g=>g.pitches);
  const cnt={};for(const p of all)cnt[p.code]=(cnt[p.code]||0)+1;
  const codes=new Set(Object.keys(cnt));for(const g of games)if(g.fg)Object.keys(g.fg.p).forEach(c=>codes.add(c));
  const arsenal=[...codes].filter(c=>(cnt[c]||0)>=10).sort((a,b)=>(cnt[b]||0)-(cnt[a]||0));
  const minor=[...codes].filter(c=>!arsenal.includes(c));
  const pname={};
  for(const c of codes){let best=null,bn=0;for(const k in nameCount){const[cc,n]=k.split('|');if(cc===c&&nameCount[k]>bn&&n){bn=nameCount[k];best=n}}pname[c]=best||FG_LABEL[c]||c}

  // norms
  const count=(g,c)=>c?(g.byCode[c]?.length||0):g.pitches.length;
  function norm(get,c,seasonVal){
    const vals=games.map(g=>({v:get(g),n:count(g,c),g})).filter(o=>o.v!=null);
    const avg=seasonVal??wmean(vals.map(o=>[o.v,o.n||1]));
    const qmin=c?MIN_PITCH:MIN_OUTING;
    let pool=vals.filter(o=>o.n>=qmin||(!c&&o.n===0&&o.g.gs===1));
    if(!pool.length)pool=vals;
    let peak=null,peakDate=null;for(const o of pool)if(peak==null||o.v>peak){peak=o.v;peakDate=o.g.date}
    return {avg,peak,peakDate,fromSeason:seasonVal!=null};
  }
  const norms={overall:{},p:{}};
  for(const k of['pit','stuff','loc'])norms.overall[k]=norm(g=>g.fg?.overall[k]??null,null,season?.overall[k]??null);
  for(const c of arsenal){norms.p[c]={};for(const k of['pit','stuff','loc'])norms.p[c][k]=norm(g=>g.fg?.p[c]?.[k]??null,c,season?.p[c]?.[k]??null)}

  const seasonAgg={all:agg(all)};for(const c of arsenal)seasonAgg[c]=agg(all.filter(p=>p.code===c));
  const profiles={};for(const c of arsenal)profiles[c]=profile(c,games,all.filter(p=>p.code===c));
  const moveOpt={};for(const c of codes)moveOpt[c]=optMove(c,games);

  const m={name,year,yearRange,team,throws,games,arsenal,minor,cnt,pname,norms,seasonAgg,profiles,moveOpt,hasSeasonRow:!!season,fgLoaded:SLOTS.filter(s=>sources[s[0]]).map(s=>s[0])};
  for(const g of games)g.eval=evaluate(g,m);
  const allBy={};for(const p of all)(allBy[p.code]||=[]).push(p);
  const avgOf=nm=>({pit:nm.pit?.avg??null,stuff:nm.stuff?.avg??null,loc:nm.loc?.avg??null});
  const Ifor=raw=>({pit:raw.pit!=null?100:null,stuff:raw.stuff!=null?100:null,loc:raw.loc!=null?100:null});
  const ov=avgOf(norms.overall);
  const ae={overall:{I:Ifor(ov),s:'off',notes:[],raw:ov},pitches:{},result:{a:seasonAgg.all,s:'off',line:gameLine(all)}};
  for(const c of arsenal){const rw=avgOf(norms.p[c]);ae.pitches[c]={I:Ifor(rw),s:'off',notes:[],n:cnt[c]||0,a:seasonAgg[c],raw:rw}}
  m.allGame={date:'ALL',isAll:true,opp:'',gs:null,pitches:all,byCode:allBy,eval:ae};
  return m;
}

function agg(list){
  const n=list.length;if(!n)return{n:0};
  const f=k=>mean(list.map(p=>p[k]).filter(v=>v!=null));
  const sw=list.filter(p=>p.swing).length,wh=list.filter(p=>p.whiff).length,cs=list.filter(p=>p.csw).length;
  const zoned=list.filter(p=>p.hasZone),inZ=zoned.filter(p=>p.inZone).length,out=zoned.filter(p=>!p.inZone);
  const ch=out.filter(p=>p.swing).length;
  const pa=list.filter(p=>p.xw!=null);
  return {n,velo:f('velo'),csw:cs/n,whiff:sw?wh/sw:null,zone:zoned.length?inZ/zoned.length:null,chase:out.length?ch/out.length:null,
    xwoba:pa.length?pa.reduce((s,p)=>s+p.xw,0)/pa.length:null,pa:pa.length,rv:list.reduce((s,p)=>s+(p.rv||0),0)};
}
function gameLine(list){
  let outs=0,K=0,BB=0,H=0,HR=0,R=0,HBP=0,BF=0;
  for(const p of list){
    R+=p.runs||0;const e=p.ev;if(!e)continue;
    if(/^(caught_stealing|pickoff|stolen_base|wild_pitch|passed_ball|other_advance|balk)/.test(e))continue;
    BF++;outs+=OUTS[e]||0;
    if(e.startsWith('strikeout'))K++;if(e==='walk'||e==='intent_walk')BB++;if(e==='hit_by_pitch')HBP++;
    if(['single','double','triple','home_run'].includes(e))H++;if(e==='home_run')HR++;
  }
  return {IP:Math.floor(outs/3)+'.'+(outs%3),outs,K,BB,H,HR,R,HBP,BF,P:list.length};
}

function optMove(c,games){
  let elig=games.filter(g=>g.fg?.p[c]?.pit!=null&&(g.byCode[c]?.length||0)>=8);
  if(elig.length<4)elig=games.filter(g=>g.fg?.p[c]?.pit!=null&&(g.byCode[c]?.length||0)>=2);
  if(elig.length<2)return null;
  const best=[...elig].sort((a,b)=>b.fg.p[c].pit-a.fg.p[c].pit).slice(0,Math.max(2,Math.ceil(elig.length/3)));
  const ps=best.flatMap(g=>g.byCode[c]).filter(p=>p.mx!=null&&p.my!=null);
  if(!ps.length)return null;
  return {x:mean(ps.map(p=>p.mx)),y:mean(ps.map(p=>p.my)),dates:best.map(g=>g.date)};
}
function profile(code,games,allP){
  const elig=games.filter(g=>g.fg?.p[code]?.pit!=null&&(g.byCode[code]?.length||0)>=8);
  if(elig.length<4)return{ok:false,nElig:elig.length};
  const sorted=[...elig].sort((a,b)=>b.fg.p[code].pit-a.fg.p[code].pit);
  const best=sorted.slice(0,Math.max(2,Math.ceil(elig.length/3)));
  const traits=[];
  for(const t of TRAITS){
    const xs=[],ys=[],yp=[],ws=[];
    for(const g of elig){const v=g.byCode[code].map(p=>p[t.k]).filter(v=>v!=null);if(v.length<5)continue;xs.push(mean(v));ys.push(g.fg.p[code].stuff??null);yp.push(g.fg.p[code].pit);ws.push(v.length)}
    const bv=best.flatMap(g=>g.byCode[code].map(p=>p[t.k]).filter(v=>v!=null));
    const sv=allP.map(p=>p[t.k]).filter(v=>v!=null);
    if(bv.length<5||!sv.length)continue;
    const m=mean(bv),s=sd(bv);
    traits.push({...t,rS:wcorr(xs,ys,ws),rP:wcorr(xs,yp,ws),target:m,tol:Math.max(0.5*s,t.min),band:Math.max(s,t.min),seasonMean:mean(sv),lo:Math.min(...sv),hi:Math.max(...sv),sSd:sd(sv)});
  }
  const strength=t=>Math.abs(t.rS??t.rP??0);
  const keys=[...traits].sort((a,b)=>strength(b)-strength(a)).slice(0,3).map(t=>t.k);
  const tk=Object.fromEntries(traits.map(t=>[t.k,t]));
  const evaluable=p=>keys.every(k=>p[k]!=null);
  const inProf=p=>keys.every(k=>Math.abs(p[k]-tk[k].target)<=tk[k].band);
  const ev=allP.filter(evaluable);
  return{ok:true,traits,keys,tk,best:best.map(g=>g.date),nElig:elig.length,evaluable,inProf,seasonRate:ev.length?ev.filter(inProf).length/ev.length:null};
}

/* ---------- lights ---------- */
const idx=(v,avg)=>(v==null||avg==null||avg<=0)?null:100*v/avg;
const base=i=>i==null?'off':i>=98?'green':i>=95?'yellow':'red';
const UP={red:'yellow',yellow:'green',green:'green',off:'off'};
const WORD={green:'Green light',yellow:'Yellow light',red:'Red light',off:'No call'};

/* Grading thresholds */
const MIN_OUTING=20;   // pitches for a full-arsenal outing to count toward his peak / get sample-size protection
const MIN_PITCH=5;     // of a given pitch to count toward that pitch's peak / get a call at all
const DEEP_RED=90;     // index below this is red no matter the sample or context
function evaluate(g,m){
  const out={overall:null,pitches:{},result:null};
  const tot=g.pitches.length;
  // overall
  {
    const o=g.fg?.overall||{},N=m.norms.overall;
    const I={pit:idx(o.pit,N.pit.avg),stuff:idx(o.stuff,N.stuff.avg),loc:idx(o.loc,N.loc.avg)};
    let s=base(I.pit);const notes=[];
    if(!g.fg||o.pit==null){s='off';notes.push('FanGraphs grades for this outing are not in the uploaded logs yet, so only Statcast results are shown.')}
    else{
      if(tot&&tot<MIN_OUTING){notes.push(`Short outing: grades rest on ${tot} pitches.`);if(s==='red'&&I.pit>=DEEP_RED){s='yellow';notes.push('Marginal red capped at yellow for sample size.')}}
      const bs=base(I.stuff),bl=base(I.loc);
      if(bs==='green'&&bl==='red')notes.push('The stuff was there; location is what pulled Pitching+ down.');
      if(bl==='green'&&bs==='red')notes.push('Command held up; the raw stuff (velo/shape) was below his norm.');
    }
    out.overall={I,s,notes,raw:o};
  }
  // result
  {
    const a=agg(g.pitches),sa=m.seasonAgg.all;
    const ri=(a.xwoba!=null&&sa.xwoba)?100*sa.xwoba/Math.max(a.xwoba,0.05):null;
    let s=a.pa>=3?base(ri):'off';
    const Lr=gameLine(g.pitches),starter=g.entry?g.entry.starter:g.gs===1;
    // Ground rules: a quality outing can't be red
    if(s==='red'&&Lr.outs>=15&&Lr.R<=3)s='yellow';               // 5+ IP, 3 or fewer runs
    if(s==='red'&&!starter&&Lr.outs>=3&&Lr.R===0)s='yellow';      // reliever finishes an inning (3+ outs) scoreless
    out.result={a,ri,s,line:gameLine(g.pitches)};
    const os=out.overall.s;
    if(os!=='off'&&s!=='off'){
      if((os==='red'||os==='yellow')&&s==='green')out.overall.notes.push('Results outran the process: contact quality held down even though the grades dipped.');
      if(os==='green'&&s==='red')out.overall.notes.push('Process was green but results were red: likely contact luck or sequencing, not pitch quality.');
    }
  }
  // pitches
  for(const c of m.arsenal){
    const v=g.fg?.p[c]||{},N=m.norms.p[c],list=g.byCode[c]||[],n=list.length;
    const I={pit:idx(v.pit,N.pit.avg),stuff:idx(v.stuff,N.stuff.avg),loc:idx(v.loc,N.loc.avg)};
    let s=base(I.pit);const notes=[];const a=agg(list),sa=m.seasonAgg[c];
    if(n===0&&v.pit==null){s='off';notes.push('Not thrown.')}
    else if(v.pit==null){s='off';notes.push('No FanGraphs grade for this pitch in this outing.')}
    else if(n<MIN_PITCH){s='off';notes.push(`Only ${n} thrown, too few to call.`)}
    else{
      const b=s;
      if(b!=='green'&&I.pit>=DEEP_RED&&a.csw!=null&&sa.csw!=null&&a.csw>=sa.csw+0.05&&(a.xwoba==null||sa.xwoba==null||a.xwoba<=sa.xwoba+0.02)){
        s=UP[s];notes.push(`Graded down, but ${pct(a.csw)} CSW beat his ${pct(sa.csw)} norm without harder contact; bumped up one light.`)}
      const drop=(sa.velo!=null&&a.velo!=null)?sa.velo-a.velo:0;
      if(s==='green'&&drop>=(FASTBALLS.has(c)?1.5:2)){s='yellow';notes.push(`Graded well, but velo sat ${drop.toFixed(1)} mph under his norm; fatigue watch.`)}
      if(n<MIN_PITCH*2&&s==='red'&&I.pit>=DEEP_RED){s='yellow';notes.push(`Only ${n} thrown; marginal red capped at yellow.`)}
      const bs=base(I.stuff),bl=base(I.loc);
      if(bs==='green'&&bl==='red')notes.push('Shape and velo were fine; the misses were location.');
      if(bl==='green'&&bs==='red')notes.push('Located well, but the raw pitch quality was below his norm.');
      if(tot&&n/tot<0.08)notes.push(`Used ${pct(n/tot)} of the time; it does not drive the outing's call.`);
    }
    out.pitches[c]={I,s,notes,n,a,raw:v};
  }
  return out;
}

/* ---------- render ---------- */
const ord=n=>n+(['th','st','nd','rd'][(n%100-20)%10]||['th','st','nd','rd'][n%100]||'th');
function basesSVG(b1,b2,b3){
  const sq=(x,y,on)=>`<rect x="${x-13}" y="${y-13}" width="26" height="26" transform="rotate(45 ${x} ${y})" rx="2" class="${on?'on':'off'}"/>`;
  return `<svg class="bases" viewBox="0 0 100 66" aria-hidden="true">${sq(50,19,b2)}${sq(27,43,b3)}${sq(73,43,b1)}</svg>`;
}
function situationCard(g,m,isAll){
  if(isAll){
    const rel=m.games.filter(x=>x.entry&&!x.entry.starter&&x.entry.li!=null);
    const starts=m.games.filter(x=>x.entry?.starter).length;
    if(!rel.length)return `<section class="card sit gs"><div class="sit-in"><h3>Situation</h3><div class="sc">&nbsp;</div>${basesSVG(0,0,0)}<div class="co">&nbsp;</div><div class="li"><b>—</b><span>gmLI</span></div></div><span class="gsmark">GS</span></section>`;
    const avg=rel.reduce((s,x)=>s+x.entry.li,0)/rel.length;
    return `<section class="card sit"><div class="sit-in"><h3>Situation</h3><div class="sc">${starts} GS · ${rel.length} relief</div>
      <div class="li big"><b>${avg.toFixed(2)}</b><span>avg gmLI (relief)</span></div>
      <div class="co">max ${Math.max(...rel.map(x=>x.entry.li)).toFixed(1)}</div></div></section>`;
  }
  const e=g.entry;
  if(!e||e.starter)return `<section class="card sit gs" aria-label="Started the game"><div class="sit-in"><h3>Situation</h3><div class="sc">Tied</div>${basesSVG(0,0,0)}<div class="co">0-0, 0 out</div><div class="li"><b>—</b><span>gmLI</span></div></div><span class="gsmark">GS</span></section>`;
  if(e.missing)return `<section class="card sit"><div class="sit-in"><h3>Situation</h3><div class="sc">—</div>${basesSVG(0,0,0)}<div class="co">Re-upload to show</div></div></section>`;
  const sc=e.diff===0?'Tied':e.diff>0?`Up ${e.diff}`:`Down ${-e.diff}`;
  const lab=`Entered ${e.top?'top':'bottom'} ${ord(e.inn)}, ${sc.toLowerCase()}, ${e.outs} out, count ${e.balls}-${e.strikes}, gmLI ${e.li==null?'unknown':e.li.toFixed(1)}`;
  return `<section class="card sit" aria-label="${esc(lab)}"><div class="sit-in"><h3>Situation</h3>
    <div class="sc">${sc} <span>· ${e.top?'Top':'Bot'} ${ord(e.inn)}</span></div>
    ${basesSVG(e.b1,e.b2,e.b3)}
    <div class="co">${e.balls}-${e.strikes}, ${e.outs} out</div>
    <div class="li"><b>${e.li==null?'—':(e.liCap?'≤':'')+e.li.toFixed(1)}</b><span>gmLI</span></div></div></section>`;
}
const PCOL={FA:'#4F80D9',SI:'#E6E619',FC:'#F39514',CH:'#8E168F',CU:'#6A4BD9',SL:'#D9B400',FS:'#34B3A0',KC:'#4B2A9E',FO:'#2A8C7A'};
const opened=new Set();const hiddenPT=new Set();
const sig=(s,size='',label)=>`<div class="signal ${size}" data-s="${s}" role="img" aria-label="${esc(label||WORD[s])}"><span class="lens r"></span><span class="lens y"></span><span class="lens g"></span></div>`;
const posOf=i=>Math.max(0,Math.min(100,(i-50)));
const MNAME={pit:'Pitching+',stuff:'Stuff+',loc:'Location+'};

function hbar(label,value,i,nm,light,isAll){
  const has=i!=null;
  const pkI=isAll?nm.peak:idx(nm.peak,nm.avg);
  const over=pkI!=null&&pkI>150;
  const aria=has?`${label}: ${value.toFixed(1)}, index ${Math.round(i)}; average ${nm.avg.toFixed(1)}; peak ${nm.peak?.toFixed(1)}`:`${label}: no grade`;
  return `<div class="hbar" role="img" aria-label="${esc(aria)}">
    <div class="l">${label}</div>
    <div><div class="track"><div class="zr"></div><div class="zy"></div>
      <div class="fill ${has?(isAll?'base':light):'off'}" style="width:${has?posOf(i):0}%"></div>
      <div class="avg"></div>
      ${pkI!=null?`<div class="peak ${over?'over':''}" style="left:${posOf(pkI)}%"></div>`:''}
    </div>
    <div class="ticks"><span style="left:0%">50</span><span style="left:25%">75</span><span style="left:50%">100</span><span style="left:75%">125</span><span style="left:100%">150</span></div></div>
    <div class="v ${has?'':'na'}"><b>${has?Math.round(i):'—'}</b>${isAll?`<span class="n1">Season avg <b>${nm.avg!=null?nm.avg.toFixed(1):'—'}</b></span><span class="n2">peak <b>${nm.peak!=null?nm.peak.toFixed(1):'—'}</b>${nm.peakDate?` | ${+nm.peakDate.slice(5,7)}/${+nm.peakDate.slice(8)}`:''}</span>`:`<span class="n1">This outing <b>${has?value.toFixed(1):'—'}</b></span><span class="n2">avg <b>${nm.avg!=null?nm.avg.toFixed(1):'—'}</b> | peak <b>${nm.peak!=null?nm.peak.toFixed(1):'—'}</b></span>`}</div>
  </div>`;
}

function box(key,title,sub,ev,nm,raw,isArs,isAll){
  const ks=['pit','stuff','loc'];
  const mini=ks.map(k=>`<span class="${isAll?'neutral':base(ev.I[k])}">${isAll?(raw[k]==null?'—':Math.round(raw[k])):(ev.I[k]==null?'—':Math.round(ev.I[k]))}<i>${MNAME[k].replace('+','').slice(0,3)}+</i></span>`).join('');
  return `<details class="box ${isArs?'arsenal':''}" data-key="${key}" ${opened.has(key)?'open':''}>
    <summary><span class="chev" aria-hidden="true"></span><h3>${esc(title)}<small>${esc(sub)}</small></h3>
      <div class="mini" aria-hidden="true">${mini}</div>${isAll?'':sig(ev.s,'',`${title}: ${WORD[ev.s]}`)}</summary>
    <div class="bars">${ks.map(k=>hbar(MNAME[k],raw[k]??null,isAll?(raw[k]??null):ev.I[k],nm[k],base(ev.I[k]),isAll)).join('')}</div>
  </details>`;
}

function moveChart(g,m){
  const codes=Object.keys(g.byCode).sort((a,b)=>(m.cnt[b]||0)-(m.cnt[a]||0));
  if(!codes.length)return '<div class="empty">No pitch data for this outing.</div>';
  const W=480,H=460,L=48,R=66,T=28,B=50,pw=W-L-R,ph=H-T-B;
  const X=v=>L+(Math.max(-25,Math.min(25,v))+25)/50*pw, Y=v=>T+(25-Math.max(-25,Math.min(25,v)))/50*ph;
  const tk=[-25,-12.5,0,12.5,25];
  let s=`<rect x="${L}" y="${T}" width="${pw}" height="${ph}" fill="var(--plate-in)" stroke="var(--plate-grid)"/>`;
  for(const v of[-12.5,12.5])s+=`<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${T+ph}" stroke="var(--plate-grid)" stroke-dasharray="5 4"/><line y1="${Y(v)}" y2="${Y(v)}" x1="${L}" x2="${L+pw}" stroke="var(--plate-grid)" stroke-dasharray="5 4"/>`;
  s+=`<line x1="${X(0)}" x2="${X(0)}" y1="${T}" y2="${T+ph}" stroke="var(--plate-zero)" stroke-width="2" stroke-dasharray="7 5"/><line y1="${Y(0)}" y2="${Y(0)}" x1="${L}" x2="${L+pw}" stroke="var(--plate-zero)" stroke-width="2" stroke-dasharray="7 5"/>`;
  for(const v of tk){
    s+=`<text x="${X(v)}" y="${T+ph+15}" text-anchor="middle" font-size="12" fill="var(--plate-ink)">${v}</text><text x="${X(v)}" y="${T-7}" text-anchor="middle" font-size="12" fill="var(--plate-ink)">${v}</text>`;
    s+=`<text x="${L-6}" y="${Y(v)+4}" text-anchor="end" font-size="12" fill="var(--plate-ink)">${v}</text><text x="${L+pw+6}" y="${Y(v)+4}" font-size="12" fill="var(--plate-ink)">${v}</text>`;
  }
  s+=`<text x="${L+pw/2}" y="${H-16}" text-anchor="middle" font-size="14" font-weight="700" fill="var(--plate-ink)">Horizontal Break (inches)</text>`;
  s+=`<text transform="translate(${W-10},${T+ph/2}) rotate(90)" text-anchor="middle" font-size="14" font-weight="700" fill="var(--plate-ink)">Vertical Break (inches)</text>`;
  s+=`<text x="${L+pw/2}" y="${H-1}" text-anchor="middle" font-size="12" fill="var(--plate-ink)">Pitch movement from pitcher's POV</text>`;
  const vis=codes.filter(c=>!hiddenPT.has(c));
  for(const c of vis)for(const p of g.byCode[c])if(p.mx!=null&&p.my!=null)
    s+=`<circle cx="${X(p.mx).toFixed(1)}" cy="${Y(p.my).toFixed(1)}" r="4.2" fill="${PCOL[c]||'#888'}" fill-opacity=".8" stroke="#222" stroke-width=".7"/>`;
  const rows=[];
  for(const c of vis){
    const ps=g.byCode[c].filter(p=>p.mx!=null&&p.my!=null);if(!ps.length)continue;
    const ax=mean(ps.map(p=>p.mx)),ay=mean(ps.map(p=>p.my)),o=m.moveOpt[c];
    if(o){
      s+=`<line x1="${X(ax)}" y1="${Y(ay)}" x2="${X(o.x)}" y2="${Y(o.y)}" stroke="var(--plate-zero)" stroke-width="1.6" stroke-dasharray="3 3"/>`;
      const ox=X(o.x),oy=Y(o.y),d=10;
      s+=`<polygon points="${ox},${oy-d} ${ox+d},${oy} ${ox},${oy+d} ${ox-d},${oy}" fill="#fff" stroke="#111" stroke-width="4.5"/><polygon points="${ox},${oy-d} ${ox+d},${oy} ${ox},${oy+d} ${ox-d},${oy}" fill="#fff" stroke="${PCOL[c]||'#888'}" stroke-width="2.5"/>`;
    }
    s+=`<circle cx="${X(ax)}" cy="${Y(ay)}" r="11" fill="#111"/><circle cx="${X(ax)}" cy="${Y(ay)}" r="9" fill="${PCOL[c]||'#888'}" stroke="#fff" stroke-width="2.5"/>`;
  }
  const lg=codes.map(c=>`<button type="button" data-pt="${c}" aria-pressed="${!hiddenPT.has(c)}"><i style="background:${PCOL[c]||'#888'}"></i>${esc(m.pname[c])}</button>`).join('');
  const tbl=codes.map(c=>{
    const ps=g.byCode[c].filter(p=>p.mx!=null&&p.my!=null);const ax=mean(ps.map(p=>p.mx)),ay=mean(ps.map(p=>p.my)),o=m.moveOpt[c];
    const f=v=>v==null?'—':v.toFixed(1),df=(a,b)=>(a==null||b==null)?'—':((a-b)>=0?'+':'')+(a-b).toFixed(1);
    return `<tr><td><span class="sw" style="background:${PCOL[c]||'#888'}"></span>${esc(m.pname[c])}</td><td>${ps.length}</td><td>${f(ax)}</td><td>${f(ay)}</td><td>${f(o?.x)}</td><td>${f(o?.y)}</td><td>${df(ax,o?.x)}</td><td>${df(ay,o?.y)}</td></tr>`}).join('');
  return `<div class="plate">
    <div class="lgtitle">PitchType</div><div class="lg">${lg}</div>
    <div class="symkey"><span><svg width="20" height="20"><circle cx="10" cy="10" r="9" fill="#111"/><circle cx="10" cy="10" r="7" fill="#999" stroke="#fff" stroke-width="2"/></svg>${g.isAll?'Season':'Start'} average</span><span><svg width="20" height="20"><polygon points="10,1 19,10 10,19 1,10" fill="#fff" stroke="#111" stroke-width="3"/></svg>Optimal profile</span></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Pitch movement chart">${s}</svg></div>
    <div class="tblwrap"><table class="mvt" style="margin-top:0"><thead><tr><th>Pitch</th><th>n</th><th>Avg H</th><th>Avg V</th><th>Opt H</th><th>Opt V</th><th>ΔH</th><th>ΔV</th></tr></thead><tbody>${tbl}</tbody></table></div>`;
}

function strip(t,gm,goodSide){
  const lo=Math.min(t.lo,t.target-t.band,gm??t.lo),hi=Math.max(t.hi,t.target+t.band,gm??t.hi);
  const pad=(hi-lo)*0.05||1,L=lo-pad,H=hi+pad,x=v=>((v-L)/(H-L)*100).toFixed(2);
  let cls='in';
  if(gm!=null&&!goodSide){const d=gm-t.target;if(Math.abs(d)>t.tol)cls=Math.abs(d)>t.band?'far':(d>0?'high':'low')}
  return `<div class="strip" aria-hidden="true">
    <div class="band" style="left:${x(t.target-t.tol)}%;width:${(x(t.target+t.tol)-x(t.target-t.tol)).toFixed(2)}%"></div>
    <div class="sm" style="left:${x(t.seasonMean)}%"></div>
    ${gm!=null?`<div class="gm ${cls}" style="left:${x(gm)}%"></div>`:''}</div>`;
}

function pitchCard(c,g,m){
  const ev=g.eval.pitches[c],pr=m.profiles[c],sa=m.seasonAgg[c],a=ev.a,tot=g.pitches.length;
  const list=g.byCode[c]||[];
  const st=(lab,v,s,f)=>`<div><b>${f(v)}</b><span>${lab}</span>${g.isAll?'':`<em>season ${f(s)}</em>`}</div>`;
  let rows='',prof='';
  if(g.isAll){
    const pd=m.norms.p[c]?.pit?.peakDate;const pg=pd?m.games.find(x=>x.date===pd):null;const pl=pg?.byCode[c]||[];
    const tr=TRAITS.map(t=>{
      const sv=list.map(p=>p[t.k]).filter(v=>v!=null),pv=pl.map(p=>p[t.k]).filter(v=>v!=null);
      if(!sv.length)return '';
      const key=pr.ok&&pr.keys.includes(t.k)?'<span class="keyt">key</span>':'';
      return `<tr><td>${t.label}${key}</td><td>${mean(sv).toFixed(t.dec)} <small>${t.unit}</small></td><td>${pv.length?mean(pv).toFixed(t.dec)+' <small>'+t.unit+'</small>':'—'}</td></tr>`}).join('');
    rows=`<table class="ttab"><thead><tr><th>Trait</th><th>Season avg</th><th>Peak${pd?` (${+pd.slice(5,7)}/${+pd.slice(8)})`:''}</th></tr></thead><tbody>${tr}</tbody></table>`;
    if(pr.ok)prof=st('In profile',pr.seasonRate,null,pct);
  }else if(pr.ok){
    rows=[...pr.traits].sort((x,y)=>(pr.keys.includes(y.k)-pr.keys.includes(x.k))||Math.abs(y.rS??0)-Math.abs(x.rS??0)).map(t=>{
      const vals=list.map(p=>p[t.k]).filter(v=>v!=null);const gm=vals.length?mean(vals):null;
      const r=t.rS??t.rP;const d=gm!=null?gm-t.target:null;
      const goodSide=d!=null&&r!=null&&Math.abs(r)>=0.2&&Math.sign(d)===Math.sign(r);
      const key=pr.keys.includes(t.k)?'<span class="keyt">key</span>':'';
      return `<div class="tr"><div class="n">${t.label}${key}<small>r ${r==null?'—':r.toFixed(2)}</small></div>${strip(t,gm,goodSide)}
        <div class="val">${gm==null?'—':gm.toFixed(t.dec)+' '+t.unit}<small>target ${t.target.toFixed(t.dec)} · Δ ${d==null?'—':(d>=0?'+':'')+d.toFixed(t.dec)}</small></div></div>`}).join('');
    const ev2=list.filter(pr.evaluable);const rate=ev2.length?ev2.filter(pr.inProf).length/ev2.length:null;
    prof=st('In profile',rate,pr.seasonRate,pct);
  }
  return `<article class="card pcard">
    <div class="ph"><h3>${esc(m.pname[c])}</h3>${g.isAll?'':sig(ev.s,'',`${m.pname[c]}: ${WORD[ev.s]}`)}</div>
    <div class="stats">${st('Thrown',ev.n,null,v=>v==null?'—':v)}${st('Usage',tot?ev.n/tot:null,m.cnt[c]/m.seasonAgg.all.n,pct)}${st('Velo',a.velo,sa.velo,v=>fmt(v,1))}${st('CSW',a.csw,sa.csw,pct)}${st('Whiff',a.whiff,sa.whiff,pct)}${st('Zone',a.zone,sa.zone,pct)}${st('Chase',a.chase,sa.chase,pct)}${st('xwOBA',a.xwoba,sa.xwoba,woba)}${prof}</div>
    ${rows?`<div class="traits"><h4>Trait profile</h4>${rows}</div>`:''}
  </article>`;
}

function render(){
  const m=M,app=$('#app');
  if(!m){app.innerHTML=MODE==='admin'?'<div class="empty">Choose a player from the list, or click <b>New player</b> and upload files.</div>':'<div class="empty">Loading…</div>';return}
  $('#title').textContent=m.name||'Start Signal';
  $('#subtitle').textContent=`${m.throws==='L'?'Left-handed':'Right-handed'} pitcher · ${m.games.length} appearances (${m.yearRange})`;
  setLogo(m.team);
  const g=selDate==='ALL'?m.allGame:(m.games.find(x=>x.date===selDate)||m.games[m.games.length-1]);selDate=g.date;
  const isAll=!!g.isAll;
  const e=g.eval,r=e.result,L=r.line;
  const dt=new Date((isAll?m.games[0].date:g.date)+'T12:00:00');
  const dLabel=dt.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  const role=g.gs===1?'Start':g.gs===0?'Relief appearance':'Appearance';

  const allChip=`<button class="chip all ${isAll?'sel':''}" data-date="ALL" aria-pressed="${isAll}" aria-label="All appearances, season baseline"><span class="d">ALL</span><span class="o">${esc(m.yearRange)}</span></button>`;
  const rail=m.games.map(x=>{
    const s=x.eval.overall.s;const lab=`${x.date}, ${x.opp}: ${WORD[s]}`;
    return `<button class="chip ${x.date===g.date?'sel':''} ${x.gs===0?'relief':''}" data-date="${x.date}" aria-pressed="${x.date===g.date}" aria-label="${esc(lab)}">
      ${sig(s,'sm','')}<span class="d">${+x.date.slice(5,7)}/${+x.date.slice(8)}</span><span class="o">${esc(x.opp)}</span></button>`}).join('');

  const deck=[box('overall','Full arsenal',`${L.P} pitches`,e.overall,m.norms.overall,e.overall.raw,true,isAll)]
    .concat(m.arsenal.map(c=>box(c,m.pname[c],`${e.pitches[c].n} thrown`,e.pitches[c],m.norms.p[c],e.pitches[c].raw,false,isAll))).join('');
  const fd=d=>new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const nStarts=m.games.filter(x=>x.gs===1).length;
  const sa=m.seasonAgg.all;
  app.innerHTML=`
  <div class="rail-wrap"><div class="rail-row" id="railRow">${allChip}<div class="rail" id="rail">${rail}</div></div></div>

  <div class="banner">
    <section class="card verdict">
      ${isAll?'':sig(e.overall.s,'lg')}
      ${isAll?`<div><h2>Season baseline</h2><p><b>${fd(m.games[0].date)} – ${fd(m.games[m.games.length-1].date)}</b> · ${m.games.length} appearances · ${nStarts} starts</p></div>`
        :`<div><h2>${WORD[e.overall.s]}</h2><p><b>${esc(dLabel)} ${esc(g.opp)}</b></p></div>`}
    </section>
    ${situationCard(g,m,isAll)}
    <section class="card">
      <div class="result-head">${isAll?'':sig(r.s,'',`Result: ${WORD[r.s]}`)}<h3>${isAll?'Season totals':'Result'}</h3></div>
      <div class="line">
        <div><b>${L.IP}</b><span>IP</span></div><div><b>${L.H}</b><span>H</span></div><div><b>${L.R}</b><span>R</span></div>
        <div><b>${L.BB}</b><span>BB</span></div><div><b>${L.K}</b><span>K</span></div><div><b>${L.HR}</b><span>HR</span></div><div><b>${L.P}</b><span>Pitches</span></div>
      </div>
      <div class="line">
        <div><b>${woba(r.a.xwoba)}</b><span>xwOBA${isAll?'':` · season ${woba(sa.xwoba)}`}</span></div>
        <div><b>${pct(r.a.csw)}</b><span>CSW${isAll?'':` · season ${pct(sa.csw)}`}</span></div>
        <div><b>${r.a.rv>=0?'+':''}${r.a.rv.toFixed(1)}</b><span>Run value</span></div>
      </div>
    </section>
  </div>

${isAll?`<div class="tcwrap"><details class="sec" data-key="__trends" ${opened.has('__trends')?'open':''}>
    <summary><span class="chev" aria-hidden="true"></span><h2>Trends</h2></summary>
    <div class="sec-body">${trendsSection(m)}</div>
  </details>
  <details class="sec" data-key="__compare" ${opened.has('__compare')?'open':''}>
    <summary><span class="chev" aria-hidden="true"></span><h2>Compare Outings</h2></summary>
    <div class="sec-body">${compareSection(m)}</div>
  </details></div>`:''}

  <div class="deck-head"><h2>${isAll?'Quality vs league':'Quality vs his norms'}</h2>
    <div class="deck-ctl"><button class="btn" id="expAll">Expand all</button><button class="btn" id="colAll">Collapse all</button></div></div>
  <div class="key" style="margin-bottom:8px"><span><i></i>100 = ${isAll?'league':'season'} average</span><span><i class="pk"></i>${isAll?'His peak outing':'Peak'}</span>${isAll?'<span>Bar = his season average</span>':''}<span>Scale 50–150</span></div>
  <div class="deck" id="deck">${deck}</div>
  ${m.minor.length?`<p class="also">Under 10 pitches this season: ${m.minor.map(c=>`${esc(m.pname[c])} (${m.cnt[c]||0})`).join(', ')}</p>`:''}

  <details class="sec" data-key="__move" ${opened.has('__move')?'open':''}>
    <summary><span class="chev" aria-hidden="true"></span><h2>Pitch movement</h2></summary>
    <div class="sec-body mvgrid">${moveChart(g,m)}</div>
  </details>

  <details class="sec" data-key="__pbp" ${opened.has('__pbp')?'open':''}>
    <summary><span class="chev" aria-hidden="true"></span><h2>Pitch by pitch</h2></summary>
    <div class="sec-body"><div class="detail-grid">${m.arsenal.map(c=>pitchCard(c,g,m)).join('')}</div></div>
  </details>
`;

  const sel=app.querySelector('.chip.sel:not(.all)');if(sel)sel.scrollIntoView({block:'nearest',inline:'center'});
  app.querySelectorAll('.chip').forEach(b=>b.addEventListener('click',()=>{selDate=b.dataset.date;render()}));
  app.querySelectorAll('details[data-key]').forEach(d=>d.addEventListener('toggle',()=>{d.open?opened.add(d.dataset.key):opened.delete(d.dataset.key)}));
  $('#expAll').addEventListener('click',()=>app.querySelectorAll('#deck details.box').forEach(d=>d.open=true));
  $('#colAll').addEventListener('click',()=>app.querySelectorAll('#deck details.box').forEach(d=>d.open=false));
  if(isAll)bindTC(m);
  app.querySelectorAll('.lg button').forEach(b=>b.addEventListener('click',()=>{
    const c=b.dataset.pt;hiddenPT.has(c)?hiddenPT.delete(c):hiddenPT.add(c);
    const y=window.scrollY;render();window.scrollTo(0,y);$(`.lg button[data-pt="${c}"]`)?.focus({preventScroll:true});
  }));
  $('#railRow').addEventListener('keydown',ev=>{
    if(ev.key!=='ArrowRight'&&ev.key!=='ArrowLeft')return;
    const seq=['ALL',...m.games.map(x=>x.date)];
    const i=seq.indexOf(selDate)+(ev.key==='ArrowRight'?1:-1);
    if(i>=0&&i<seq.length){selDate=seq[i];render();$('#railRow .chip.sel')?.focus()}
  });
}

/* ---------- trends & compare ---------- */
const MET=[
  {k:'pit',label:'Pitching+',type:'grade',dec:1},{k:'stuff',label:'Stuff+',type:'grade',dec:1},{k:'loc',label:'Location+',type:'grade',dec:1},
  ...TRAITS.map(t=>({k:t.k,label:t.label,type:'trait',dec:t.dec,unit:t.unit})),
  {k:'csw',label:'CSW%',type:'rate',pct:true},{k:'whiff',label:'Whiff%',type:'rate',pct:true},{k:'zone',label:'Zone%',type:'rate',pct:true},
  {k:'chase',label:'Chase%',type:'rate',pct:true},{k:'xwoba',label:'xwOBA',type:'rate',dec:3},{k:'usage',label:'Usage%',type:'rate',pct:true}
];
const METK=Object.fromEntries(MET.map(x=>[x.k,x]));
const GRANS=[['pitch','By pitch'],['outing','By outing'],['roll5','Rolling 5 outings'],['month','By month'],['half','By half'],['year','By year']];
const TS={series:[{scope:'overall',k:'pit'}],gran:'outing',pickScope:'overall',pickK:'pit'};
const CMP={a:null,b:null};
const scopeName=(m,s)=>s==='overall'?'Full arsenal':s==='ALLP'?'All pitches':m.pname[s];
const scopeCol=s=>(s==='overall'||s==='ALLP')?'#F0F1F2':(PCOL[s]||'#999');
const fmtM=(mt,v)=>v==null?'—':mt.pct?(v*100).toFixed(1)+'%':mt.k==='xwoba'?woba(v):v.toFixed(mt.dec??1);
function validScope(mt,s){if(mt.type==='grade')return s!=='ALLP';if(mt.k==='usage')return s!=='overall'&&s!=='ALLP';return s!=='overall'}
function halfKey(d){return d.slice(0,4)+(d.slice(5)<='07-15'?' 1st half':' 2nd half')}
function bkey(d,gran){return gran==='month'?d.slice(0,7):gran==='half'?halfKey(d):gran==='year'?d.slice(0,4):d}
function blabel(k,gran){
  if(gran==='month'){const dt=new Date(k+'-15T12:00:00');return dt.toLocaleDateString('en-US',{month:'short',year:'2-digit'})}
  if(gran==='half'||gran==='year')return k;
  return `${+k.slice(5,7)}/${+k.slice(8,10)}`;
}
function scopePitches(g,s){return s==='ALLP'||s==='overall'?g.pitches:(g.byCode[s]||[])}
function pitchStat(list,k,total){
  if(!list.length)return null;
  if(k==='usage')return total?list.length/total:null;
  const T=TRAITS.find(t=>t.k===k);
  if(T){const v=list.map(p=>p[k]).filter(v=>v!=null);return v.length?mean(v):null}
  return agg(list)[k]??null;
}
function gradeOf(g,s,k){return s==='overall'?(g.fg?.overall[k]??null):(g.fg?.p[s]?.[k]??null)}
function outingValue(g,s,k){
  const mt=METK[k];
  if(mt.type==='grade')return gradeOf(g,s,k);
  const list=scopePitches(g,s);if(k!=='usage'&&list.length<(mt.type==='rate'?5:1))return null;
  return pitchStat(list,k,g.pitches.length);
}
function seriesData(m,s,k,gran){
  const mt=METK[k];let g2=gran;
  if(gran==='pitch'&&mt.type!=='trait')g2='outing';
  const games=m.games;
  if(g2==='pitch'){
    const pts=[];for(const g of games)for(const p of scopePitches(g,s))if(p[k]!=null)pts.push({key:`${g.date}|${String(p.ab).padStart(4,'0')}|${String(p.pn).padStart(3,'0')}`,label:blabel(g.date,'outing'),y:p[k],n:1});
    return {pts,gran:'pitch'};
  }
  if(mt.type==='grade'){
    const vals=games.map(g=>({g,v:gradeOf(g,s,k),w:(s==='overall'?g.pitches.length:(g.byCode[s]?.length||0))||1})).filter(o=>o.v!=null);
    if(g2==='roll5')return{gran:g2,pts:vals.map((o,i)=>{const win=vals.slice(Math.max(0,i-4),i+1);return{key:o.g.date,label:blabel(o.g.date,'outing'),y:wmean(win.map(x=>[x.v,x.w])),n:win.length}})};
    const B={};for(const o of vals)(B[bkey(o.g.date,g2)]||=[]).push(o);
    return{gran:g2,pts:Object.keys(B).sort().map(key=>({key,label:blabel(key,g2),y:wmean(B[key].map(x=>[x.v,x.w])),n:B[key].length}))};
  }
  const used=games.filter(g=>scopePitches(g,s).length>0||(k==='usage'&&g.pitches.length));
  if(g2==='roll5'){
    const withS=games.filter(g=>scopePitches(g,s).length>0);
    return{gran:g2,pts:withS.map((g,i)=>{const win=withS.slice(Math.max(0,i-4),i+1);const list=win.flatMap(x=>scopePitches(x,s));const tot=win.reduce((a,x)=>a+x.pitches.length,0);return{key:g.date,label:blabel(g.date,'outing'),y:pitchStat(list,k,tot),n:list.length}}).filter(p=>p.y!=null)};
  }
  const B={};for(const g of used){const key=bkey(g.date,g2);(B[key]||={list:[],tot:0});B[key].list.push(...scopePitches(g,s));B[key].tot+=g.pitches.length}
  return{gran:g2,pts:Object.keys(B).sort().map(key=>{const b=B[key];const min=g2==='outing'&&mt.type==='rate'&&k!=='usage'?5:1;return{key,label:blabel(key,g2),y:b.list.length>=min?pitchStat(b.list,k,b.tot):null,n:b.list.length}}).filter(p=>p.y!=null)};
}
function lineChart(mt,series,gl){
  const keys=[...new Set(series.flatMap(s=>s.pts.map(p=>p.key)))].sort();
  if(!keys.length)return '<div class="empty">No data for this selection.</div>';
  const lab={};for(const s of series)for(const p of s.pts)lab[p.key]=p.label;
  const xi=Object.fromEntries(keys.map((k,i)=>[k,i]));
  const ys=series.flatMap(s=>s.pts.map(p=>p.y));if(mt.type==='grade')ys.push(100);
  let lo=Math.min(...ys),hi=Math.max(...ys);const pad=(hi-lo)*0.1||Math.abs(hi)*0.05||1;lo-=pad;hi+=pad;
  const W=900,H=230,L=58,R=14,T=12,B=30,pw=W-L-R,ph=H-T-B;
  const X=i=>L+(keys.length===1?pw/2:i/(keys.length-1)*pw),Y=v=>T+(hi-v)/(hi-lo)*ph;
  let s='';
  for(let j=0;j<=4;j++){const v=lo+(hi-lo)*j/4;s+=`<line x1="${L}" x2="${L+pw}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--rule)"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="var(--ink-dim)">${fmtM(mt,v)}</text>`}
  if(mt.type==='grade')s+=`<line x1="${L}" x2="${L+pw}" y1="${Y(100)}" y2="${Y(100)}" stroke="var(--ink)" stroke-dasharray="6 4" stroke-width="1.5"/><text x="${L+pw-2}" y="${Y(100)-4}" text-anchor="end" font-size="10" fill="var(--ink-dim)">100 lg avg</text>`;
  const step=Math.max(1,Math.ceil(keys.length/12));let prevL=null;
  keys.forEach((k,i)=>{const l=lab[k];if(i%step===0&&l!==prevL){s+=`<text x="${X(i)}" y="${H-10}" text-anchor="middle" font-size="11" fill="var(--ink-dim)">${esc(l)}</text>`;prevL=l}});
  const dense=keys.length>150;
  for(const se of series){
    const pts=se.pts.map(p=>[X(xi[p.key]),Y(p.y),p]);
    if(pts.length>1)s+=`<polyline fill="none" stroke="${se.color}" stroke-width="${dense?1:2.2}" stroke-opacity="${dense?.55:1}" points="${pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}"/>`;
    for(const[x,y,p]of pts)s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${dense?1.6:3.6}" fill="${se.color}" stroke="${dense?'none':'#000'}" stroke-width=".8"><title>${esc(se.name)} · ${esc(p.label)}: ${fmtM(mt,p.y)}${p.n>1?` (n ${p.n})`:''}</title></circle>`;
  }
  const lg=series.map(se=>`<span><i style="background:${se.color}"></i>${esc(se.name)}${se.note?` <em>${esc(se.note)}</em>`:''}</span>`).join('');
  return `<div class="tchart"><div class="thead"><b>${esc(mt.label)}${mt.unit?` <small>(${mt.unit})</small>`:''}</b><div class="tlg">${lg}</div></div>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(mt.label)} trend">${s}</svg></div>`;
}
function trendsSection(m){
  const scopes=[['overall','Full arsenal'],['ALLP','All pitches'],...m.arsenal.map(c=>[c,m.pname[c]])];
  const mt=METK[TS.pickK];
  const sOpts=scopes.map(([v,l])=>`<option value="${v}" ${v===TS.pickScope?'selected':''} ${validScope(mt,v)?'':'disabled'}>${esc(l)}</option>`).join('');
  const grp=(t,l)=>`<optgroup label="${l}">${MET.filter(x=>x.type===t).map(x=>`<option value="${x.k}" ${x.k===TS.pickK?'selected':''}>${esc(x.label)}</option>`).join('')}</optgroup>`;
  const tags=TS.series.map((se,i)=>`<span class="tag"><i style="background:${scopeCol(se.scope)}"></i>${esc(scopeName(m,se.scope))} · ${esc(METK[se.k].label)}<button type="button" data-rm="${i}" aria-label="Remove ${esc(scopeName(m,se.scope))} ${esc(METK[se.k].label)}">×</button></span>`).join('');
  const gb=GRANS.map(([v,l])=>`<button type="button" class="seg ${TS.gran===v?'on':''}" data-gran="${v}" aria-pressed="${TS.gran===v}">${l}</button>`).join('');
  const byMet={};for(const se of TS.series)(byMet[se.k]||=[]).push(se);
  const charts=Object.keys(byMet).map(k=>{
    const mt=METK[k];
    const ser=byMet[k].map(se=>{const d=seriesData(m,se.scope,k,TS.gran);return{name:scopeName(m,se.scope),color:scopeCol(se.scope),pts:d.pts,note:d.gran!==TS.gran?'by outing':''}});
    return lineChart(mt,ser);
  }).join('');
  return `<div class="tctl">
      <label>Scope <select id="tScope">${sOpts}</select></label>
      <label>Data point <select id="tMet">${grp('grade','Grades')}${grp('trait','Pitch traits')}${grp('rate','Outcomes')}</select></label>
      <button class="btn" id="tAdd" type="button">Add to chart</button>
    </div>
    <div class="tags">${tags||'<span class="meta">No data points selected</span>'}</div>
    <div class="segs" role="group" aria-label="Timeline granularity">${gb}</div>
    ${charts}`;
}
/* compare */
const sdCache={};
function metricSd(m,s,k){
  const id=s+'|'+k;if(id in sdCache)return sdCache[id];
  const v=m.games.map(g=>{const n=scopePitches(g,s).length;return (METK[k]?.type==='grade'||n>=5)?outingValue(g,s,k):null}).filter(x=>x!=null);
  return sdCache[id]=v.length>=4?sd(v):null;
}
function compareSection(m){
  const gs=m.games;
  if(!CMP.a||!gs.find(x=>x.date===CMP.a)){CMP.b=gs[gs.length-1].date;CMP.a=(gs[gs.length-2]||gs[0]).date}
  const A=gs.find(x=>x.date===CMP.a),B=gs.find(x=>x.date===CMP.b);
  const EMO={green:'🟢',yellow:'🟡',red:'🔴',off:'⚪'};
  const opt=sel=>gs.map(x=>`<option value="${x.date}" ${x.date===sel?'selected':''}>${EMO[x.eval.overall.s]} ${+x.date.slice(5,7)}/${+x.date.slice(8)} ${esc(x.opp)}${x.gs===0?' (R)':''}</option>`).join('');
  const labT=g=>`${+g.date.slice(5,7)}/${+g.date.slice(8)} ${g.opp}`;
  const lab=g=>`<span class="lt ${g.eval.overall.s}">${esc(labT(g))}</span>`;
  // lights grid
  const rowsL=[['overall','Full arsenal'],...m.arsenal.map(c=>[c,m.pname[c]])].map(([s,l])=>{
    const ea=s==='overall'?A.eval.overall:A.eval.pitches[s],eb=s==='overall'?B.eval.overall:B.eval.pitches[s];
    const gv=(g,s)=>{const v=gradeOf(g,s,'pit');return v==null?'—':v.toFixed(1)};
    return `<tr><td>${esc(l)}</td><td>${sig(ea.s,'sm',WORD[ea.s])} <b>${gv(A,s)}</b></td><td>${sig(eb.s,'sm',WORD[eb.s])} <b>${gv(B,s)}</b></td></tr>`}).join('');
  // discrepancies
  const diffs=[];
  const scopes=['overall','ALLP',...m.arsenal];
  for(const s of scopes)for(const mt of MET){
    if(!validScope(mt,s))continue;
    if(mt.type!=='grade'&&s!=='ALLP'&&(scopePitches(A,s).length<5||scopePitches(B,s).length<5)&&mt.k!=='usage')continue;
    const va=outingValue(A,s,mt.k),vb=outingValue(B,s,mt.k);if(va==null||vb==null)continue;
    const sdv=metricSd(m,s,mt.k);if(!sdv)continue;
    diffs.push({s,mt,va,vb,z:Math.abs(vb-va)/sdv});
  }
  diffs.sort((x,y)=>y.z-x.z);
  const top=diffs.slice(0,12);const zmax=Math.max(3,...top.map(d=>d.z));
  const rowsD=top.map((d,i)=>{const dv=d.vb-d.va;return `<tr class="${i<3?'hot':''}"><td><i class="dot" style="background:${scopeCol(d.s)}"></i>${esc(scopeName(m,d.s))}</td><td>${esc(d.mt.label)}</td><td>${fmtM(d.mt,d.va)}</td><td>${fmtM(d.mt,d.vb)}</td><td>${dv>=0?'+':'−'}${fmtM(d.mt,Math.abs(dv))}</td>
    <td class="zc"><div class="zbar"><span style="width:${(d.z/zmax*100).toFixed(1)}%"></span></div><small>${d.z.toFixed(1)} SD</small></td></tr>`}).join('');
  // line score
  const La=A.eval.result.line,Lb=B.eval.result.line;
  const ls=['IP','H','R','BB','K','HR','P'].map(k=>`<tr><td>${k==='P'?'Pitches':k}</td><td>${La[k]}</td><td>${Lb[k]}</td></tr>`).join('');
  return `<div class="tctl">
      <label>Outing A <select id="cA">${opt(CMP.a)}</select></label>
      <button class="btn" id="cSwap" type="button" aria-label="Swap outings">⇄</button>
      <label>Outing B <select id="cB">${opt(CMP.b)}</select></label>
    </div>
    <div class="cgrid">
      <div class="card"><h4>Biggest discrepancies <small>ranked by gap in his outing-to-outing standard deviations</small></h4>
        <div class="tblwrap"><table class="ctab dis"><thead><tr><th>Scope</th><th>Data point</th><th>${lab(A)}</th><th>${lab(B)}</th><th>B − A</th><th>Gap</th></tr></thead><tbody>${rowsD||'<tr><td colspan="6">No comparable data</td></tr>'}</tbody></table></div></div>
      <div class="cside">
        <div class="card"><h4>Lights · Pitching+</h4><table class="ctab"><thead><tr><th></th><th>${lab(A)}</th><th>${lab(B)}</th></tr></thead><tbody>${rowsL}</tbody></table></div>
        <div class="card"><h4>Line</h4><table class="ctab"><thead><tr><th></th><th>${lab(A)}</th><th>${lab(B)}</th></tr></thead><tbody>${ls}</tbody></table></div>
      </div>
    </div>
    <div class="card" style="margin-top:12px"><h4>Movement · average by pitch</h4>${moveCompare(A,B,m)}</div>`;
}
function moveCompare(A,B,m){
  const W=480,H=440,L=48,R=48,T=20,Bm=36,pw=W-L-R,ph=H-T-Bm;
  const X=v=>L+(Math.max(-25,Math.min(25,v))+25)/50*pw,Y=v=>T+(25-Math.max(-25,Math.min(25,v)))/50*ph;
  let s=`<rect x="${L}" y="${T}" width="${pw}" height="${ph}" fill="var(--plate-in)" stroke="var(--plate-grid)"/>`;
  for(const v of[-12.5,12.5])s+=`<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${T+ph}" stroke="var(--plate-grid)" stroke-dasharray="5 4"/><line y1="${Y(v)}" y2="${Y(v)}" x1="${L}" x2="${L+pw}" stroke="var(--plate-grid)" stroke-dasharray="5 4"/>`;
  s+=`<line x1="${X(0)}" x2="${X(0)}" y1="${T}" y2="${T+ph}" stroke="var(--plate-zero)" stroke-width="2" stroke-dasharray="7 5"/><line y1="${Y(0)}" y2="${Y(0)}" x1="${L}" x2="${L+pw}" stroke="var(--plate-zero)" stroke-width="2" stroke-dasharray="7 5"/>`;
  for(const v of[-25,-12.5,0,12.5,25])s+=`<text x="${X(v)}" y="${T+ph+14}" text-anchor="middle" font-size="11" fill="var(--plate-ink)">${v}</text><text x="${L-6}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="var(--plate-ink)">${v}</text>`;
  s+=`<text x="${L+pw/2}" y="${H-4}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--plate-ink)">Horizontal Break (in, pitcher's POV)</text>`;
  const codes=[...new Set([...Object.keys(A.byCode),...Object.keys(B.byCode)])];
  const av=(g,c)=>{const ps=(g.byCode[c]||[]).filter(p=>p.mx!=null);return ps.length?[mean(ps.map(p=>p.mx)),mean(ps.map(p=>p.my))]:null};
  for(const c of codes){const a=av(A,c),b=av(B,c),col=PCOL[c]||'#999';
    if(a&&b)s+=`<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="var(--plate-zero)" stroke-width="1.6" stroke-dasharray="3 3"/>`;
    if(a)s+=`<circle cx="${X(a[0])}" cy="${Y(a[1])}" r="9" fill="${col}" stroke="#111" stroke-width="2"><title>${esc(m.pname[c])} A: ${a[0].toFixed(1)}, ${a[1].toFixed(1)}</title></circle>`;
    if(b)s+=`<circle cx="${X(b[0])}" cy="${Y(b[1])}" r="8" fill="none" stroke="${col}" stroke-width="4"><title>${esc(m.pname[c])} B: ${b[0].toFixed(1)}, ${b[1].toFixed(1)}</title></circle><circle cx="${X(b[0])}" cy="${Y(b[1])}" r="10.5" fill="none" stroke="#111" stroke-width="1"/>`;
  }
  const lg=codes.map(c=>`<span><i style="background:${PCOL[c]||'#999'}"></i>${esc(m.pname[c])}</span>`).join('');
  const f=v=>v==null?'—':v.toFixed(1),dd=(a,b)=>(a==null||b==null)?'—':((b-a)>=0?'+':'')+(b-a).toFixed(1);
  const tb=codes.map(c=>{const a=av(A,c),b=av(B,c);return `<tr><td><i class="dot" style="background:${PCOL[c]||'#999'}"></i>${esc(m.pname[c])}</td><td>${f(a?.[0])}</td><td>${f(a?.[1])}</td><td>${f(b?.[0])}</td><td>${f(b?.[1])}</td><td>${dd(a?.[0],b?.[0])}</td><td>${dd(a?.[1],b?.[1])}</td></tr>`}).join('');
  return `<div class="mvc"><div class="plate"><div class="lg static">${lg}</div>
    <div class="symkey"><span><svg width="18" height="18"><circle cx="9" cy="9" r="7" fill="#999" stroke="#111" stroke-width="2"/></svg>Outing A</span><span><svg width="18" height="18"><circle cx="9" cy="9" r="6" fill="none" stroke="#999" stroke-width="3"/></svg>Outing B</span></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Average movement, outing A vs B">${s}</svg></div>
    <div class="tblwrap"><table class="ctab"><thead><tr><th>Pitch</th><th>A H</th><th>A V</th><th>B H</th><th>B V</th><th>ΔH</th><th>ΔV</th></tr></thead><tbody>${tb}</tbody></table></div></div>`;
}
function bindTC(m){
  const keep=fn=>()=>{const y=window.scrollY;fn();render();window.scrollTo(0,y)};
  const ts=$('#tScope'),tm=$('#tMet');if(!ts)return;
  tm.addEventListener('change',keep(()=>{TS.pickK=tm.value;if(!validScope(METK[TS.pickK],TS.pickScope))TS.pickScope=METK[TS.pickK].type==='grade'?'overall':(TS.pickK==='usage'?m.arsenal[0]:'ALLP')}));
  ts.addEventListener('change',()=>{TS.pickScope=ts.value});
  $('#tAdd').addEventListener('click',keep(()=>{TS.pickScope=ts.value;TS.pickK=tm.value;if(!validScope(METK[TS.pickK],TS.pickScope))return;if(!TS.series.some(x=>x.scope===TS.pickScope&&x.k===TS.pickK))TS.series.push({scope:TS.pickScope,k:TS.pickK})}));
  document.querySelectorAll('[data-rm]').forEach(b=>b.addEventListener('click',keep(()=>TS.series.splice(+b.dataset.rm,1))));
  document.querySelectorAll('[data-gran]').forEach(b=>b.addEventListener('click',keep(()=>TS.gran=b.dataset.gran)));
  $('#cA').addEventListener('change',keep(()=>CMP.a=$('#cA').value));
  $('#cB').addEventListener('change',keep(()=>CMP.b=$('#cB').value));
  $('#cSwap').addEventListener('click',keep(()=>{[CMP.a,CMP.b]=[CMP.b,CMP.a]}));
}

/* =====================================================================
   Loading, admin (GitHub-backed player folders) and player viewer
   ===================================================================== */
const on=(sel,ev,fn)=>{const e=$(sel);if(e)e.addEventListener(ev,fn);return e};
let viewerLogo=null,pendingLogo=null,currentLogo=null;
const memLogo={};

/* ---------- logo ---------- */
function showLogo(team,src){
  currentLogo=src||null;
  const h=$('#hlogo');if(h)h.style.backgroundImage=src?`url("${String(src).replace(/"/g,'%22')}")`:'none';
  const st=$('#logoSlotTxt'),sl=$('#logoSlot');
  if(st){st.textContent=src?`${team||'Team'} logo loaded · choose a file to replace`:`Choose an image (PNG or SVG)`;sl.classList.toggle('ok',!!src)}
}
async function setLogo(team){
  if(MODE==='player'){showLogo(team,viewerLogo);return}
  let src=memLogo[team]||null;
  if(!src){try{src=localStorage.getItem('logo:'+team)}catch(e){}}
  showLogo(team,src);
}
function readDataURL(f){return new Promise((res,rej)=>{const rd=new FileReader();rd.onload=()=>res(rd.result);rd.onerror=rej;rd.readAsDataURL(f)})}
function saveLogo(team,d){memLogo[team]=d;try{localStorage.setItem('logo:'+team,d)}catch(e){}showLogo(team,d)}
const isImage=f=>/^image\//.test(f.type)||/\.(png|svg|jpe?g|webp|gif)$/i.test(f.name);

/* ---------- ingest ---------- */
const slotName=k=>({savant:'Baseball Savant',stf:'Stuff+',loc:'Location+',pit:'Pitching+'})[k];
function resetSources(){
  for(const k in sources)sources[k]=null;pendingLogo=null;
  document.querySelectorAll('.slot[data-slot]').forEach(s=>{s.classList.remove('ok');s.querySelector('span').textContent='Choose .csv'});
  const ls=$('#logoSlot');if(ls){ls.classList.remove('ok');$('#logoSlotTxt').textContent='Choose an image (PNG or SVG)'}
  const msg=$('#msg');if(msg){msg.textContent='';msg.className='msg'}
}
function ingest(text,fname,forced){
  const p=parseCSV(text);const kind=classify(p.fields);const msg=$('#msg');
  if(!kind){if(msg){msg.className='msg err';msg.textContent=`${fname} doesn't match any expected layout. Savant files need pitch_type and release_speed; FanGraphs logs need Stf+, Loc+ or Pit+ pitch columns.`}return false}
  if(forced&&forced!==kind&&msg){msg.className='msg';msg.textContent=`${fname} looks like a ${slotName(kind)} file, so it was placed there.`}
  sources[kind]={...p,name:fname};
  const el=document.querySelector(`.slot[data-slot="${kind}"]`);if(el){el.classList.add('ok');el.querySelector('span').textContent=`${fname} · ${p.rows.length} rows`}
  return true;
}
function resetViewState(){for(const k in sdCache)delete sdCache[k];CMP.a=null;CMP.b=null;hiddenPT.clear()}
function tryBuild(){
  const msg=$('#msg');
  if(!sources.savant){msg.className='msg';msg.textContent='Add the Baseball Savant pitch log to continue.';return}
  if(!sources.stf&&!sources.loc&&!sources.pit){msg.className='msg';msg.textContent='Add at least one FanGraphs game log to continue.';return}
  try{
    M=build();resetViewState();selDate=M.games[M.games.length-1].date;
    if(pendingLogo){saveLogo(M.team,pendingLogo);pendingLogo=null}
    const missing=SLOTS.filter(s=>!sources[s[0]]).map(s=>({stf:'Stuff+',loc:'Location+',pit:'Pitching+'})[s[0]]);
    msg.className='msg';msg.textContent=`Loaded ${M.games.length} appearances.`+(missing.length?` Missing: ${missing.join(', ')} log.`:'');
    ADMIN.staged=true;openPublish();
  }catch(err){console.error(err);msg.className='msg err';msg.textContent='Could not build the dashboard: '+err.message}
}
async function handleFiles(files,forced){
  const list=[...files];
  for(const f of list){
    if(isImage(f)){pendingLogo=await readDataURL(f);showLogo('',pendingLogo);continue}
    ingest(await f.text(),f.name,forced==='logo'?null:forced);
  }
  if(!list.some(f=>!isImage(f))&&M&&ADMIN.staged){saveLogo(M.team,pendingLogo);pendingLogo=null;return}
  tryBuild();
}

/* ---------- crypto ---------- */
const te=new TextEncoder(),td=new TextDecoder();
const b64=u8=>{let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const rnd=n=>crypto.getRandomValues(new Uint8Array(n));
const rand=n=>{const a='abcdefghjkmnpqrstuvwxyz23456789';return[...rnd(n)].map(x=>a[x%a.length]).join('')};
async function pipe(bytes,stream){return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer())}
async function passKey(pass,salt){
  const km=await crypto.subtle.importKey('raw',te.encode(pass),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
const rawKey=b=>crypto.subtle.importKey('raw',b,'AES-GCM',false,['encrypt','decrypt']);
async function enc(key,bytes){const iv=rnd(12);return{iv:b64(iv),ct:b64(new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,bytes)))}}
async function dec(key,o){return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(o.iv)},key,unb64(o.ct)))}
/* A report = data encrypted with a random key K; K is stored twice: once locked with the
   player's password, once locked with the admin passphrase. Player metadata (name, password)
   is readable by the admin only. */
async function makeEnvelope(payload,playerPass,adminKey,meta){
  const K=rnd(32);let bytes=te.encode(JSON.stringify(payload));const gz=!!window.CompressionStream;
  if(gz)bytes=await pipe(bytes,new CompressionStream('gzip'));
  const salt=rnd(16);
  return{v:2,updated:new Date().toISOString(),gz,data:await enc(await rawKey(K),bytes),
    player:{salt:b64(salt),...await enc(await passKey(playerPass,salt),K)},
    admin:await enc(adminKey,K),meta:await enc(adminKey,te.encode(JSON.stringify(meta)))};
}
async function openData(env,K){let b=await dec(await rawKey(K),env.data);if(env.gz)b=await pipe(b,new DecompressionStream('gzip'));return JSON.parse(td.decode(b))}
async function openAsPlayer(env,pass){return openData(env,await dec(await passKey(pass,unb64(env.player.salt)),env.player))}
async function openAsAdmin(env,adminKey){return openData(env,await dec(adminKey,env.admin))}
async function readMeta(env,adminKey){return JSON.parse(td.decode(await dec(adminKey,env.meta)))}
async function rewrapPlayer(env,adminKey,newPass,meta){
  const K=await dec(adminKey,env.admin);const salt=rnd(16);
  return{...env,player:{salt:b64(salt),...await enc(await passKey(newPass,salt),K)},meta:await enc(adminKey,te.encode(JSON.stringify(meta)))};
}

/* ---------- payload in / out ---------- */
const SAVANT_KEEP=['pitch_type','pitch_name','game_date','game_year','release_speed','release_pos_x','release_pos_z','player_name','pitcher','p_throws','events','description','zone','pfx_x','pfx_z','release_spin_rate','release_extension','estimated_woba_using_speedangle','woba_value','woba_denom','launch_speed','bat_score','post_bat_score','delta_pitcher_run_exp','arm_angle','home_team','away_team','inning_topbot','at_bat_number','pitch_number','inning','outs_when_up','on_1b','on_2b','on_3b','home_score','away_score','fld_score','balls','strikes'];
function buildPayload(){
  const sv=sources.savant,keep=SAVANT_KEEP.filter(k=>sv.fields.includes(k));
  const un=s=>s?Papa.unparse(s.rows,{columns:s.fields}):null;
  return{name:M.name,team:M.team,logo:currentLogo&&currentLogo.startsWith('data:')?currentLogo:null,
    savant:Papa.unparse({fields:keep,data:sv.rows.map(r=>keep.map(k=>r[k]??''))}),stf:un(sources.stf),loc:un(sources.loc),pit:un(sources.pit)};
}
function loadPayload(p){
  resetSources();
  const add=(slot,text)=>{if(text){const r=parseCSV(text);sources[slot]={...r,name:slot}}};
  add('savant',p.savant);add('stf',p.stf);add('loc',p.loc);add('pit',p.pit);
  if(MODE==='player')viewerLogo=p.logo||null;else if(p.logo)memLogo[p.team]=p.logo;
  M=build();resetViewState();selDate=M.games[M.games.length-1].date;render();
}

/* ---------- player page ---------- */
async function bootPlayer(){
  const app=$('#app'),meth=document.querySelector('.method');
  let env;
  try{const r=await fetch('report.json',{cache:'no-store'});if(!r.ok)throw 0;env=await r.json()}
  catch(e){app.innerHTML='<div class="empty">This report isn\u2019t available.</div>';return}
  const key='pass:'+location.pathname;
  const open=async pass=>{
    const p=await openAsPlayer(env,pass);loadPayload(p);
    if(meth)meth.hidden=false;
    const u=$('#updated');if(u){u.hidden=false;u.textContent='Report updated '+new Date(env.updated).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
  };
  let saved=null;try{saved=localStorage.getItem(key)}catch(e){}
  if(saved){try{await open(saved);return}catch(e){try{localStorage.removeItem(key)}catch(_){}}}
  app.innerHTML=`<form class="gate card" id="gate">
    <h2>Enter your password</h2>
    <input id="gPass" type="password" autocomplete="current-password" aria-label="Password" required>
    <label class="rem"><input type="checkbox" id="gRem" checked> Remember on this device</label>
    <button class="btn primary" type="submit">Open report</button>
    <p class="msg" id="gMsg" role="status"></p></form>`;
  $('#gPass').focus();
  $('#gate').addEventListener('submit',async ev=>{
    ev.preventDefault();const pass=$('#gPass').value;const m=$('#gMsg');m.className='msg';m.textContent='Opening\u2026';
    try{await open(pass);if($('#gRem')?.checked!==false){try{localStorage.setItem(key,pass)}catch(e){}}}
    catch(e){m.className='msg err';m.textContent='That password didn\u2019t open this report.'}
  });
}

/* ---------- GitHub ---------- */
/* Optional: fill in only if the tool is hosted somewhere other than <owner>.github.io/<repo>/ */
const CONFIG={owner:'',repo:'',branch:''};
const GH={owner:'',repo:'',branch:'main',token:''};
function detectRepo(){
  const h=location.hostname;if(!h.endsWith('.github.io'))return{};
  const owner=h.split('.')[0],seg=location.pathname.split('/').filter(Boolean)[0];
  return{owner,repo:seg&&!seg.includes('.')?seg:`${owner}.github.io`};
}
function siteBase(){const user=GH.repo.toLowerCase()===`${GH.owner}.github.io`.toLowerCase();return`https://${GH.owner}.github.io/${user?'':GH.repo+'/'}`}
const playerURL=slug=>`${siteBase()}players/${slug}/`;
async function gh(path,opts={}){
  const r=await fetch(`https://api.github.com/repos/${GH.owner}/${GH.repo}${path}`,{cache:'no-store',...opts,
    headers:{Accept:'application/vnd.github+json',...(GH.token?{Authorization:`Bearer ${GH.token}`}:{}),'X-GitHub-Api-Version':'2022-11-28',...(opts.headers||{})}});
  if(!r.ok){let m='';try{m=(await r.json()).message}catch(e){}const e=new Error(`GitHub ${r.status}${m?': '+m:''}`);e.status=r.status;throw e}
  return r;
}
const q=()=>`?ref=${encodeURIComponent(GH.branch)}`;
async function ghFile(path){try{return await(await gh(`/contents/${path}${q()}`)).json()}catch(e){if(e.status===404)return null;throw e}}
async function ghRaw(path){return(await gh(`/contents/${path}${q()}`,{headers:{Accept:'application/vnd.github.raw'}})).text()}
async function ghList(path){try{const j=await(await gh(`/contents/${path}${q()}`)).json();return Array.isArray(j)?j:[]}catch(e){if(e.status===404)return[];throw e}}
async function ghPut(path,text,message){
  const cur=await ghFile(path);const body={message,content:b64(te.encode(text)),branch:GH.branch};if(cur?.sha)body.sha=cur.sha;
  await gh(`/contents/${path}`,{method:'PUT',body:JSON.stringify(body)});
}
async function ghDel(path,sha,message){await gh(`/contents/${path}`,{method:'DELETE',body:JSON.stringify({message,sha,branch:GH.branch})})}

/* ---------- admin session ---------- */
const ADMIN={key:null,mk:null,user:'',pass:null,file:null,mode:'signin',players:[],cur:null,staged:false};
const CHECK='start-signal-admin-v1';
function setView(v){
  document.body.dataset.view=v;
  const pp=$('#playersPanel'),app=$('#app');
  if(v==='report'){
    ['#playersPanel','#upload','#publishPanel','#accountPanel'].forEach(s=>{const e=$(s);if(e)e.hidden=true});
    app.hidden=false;render();window.scrollTo({top:0});
  }else if(v==='players'){
    app.hidden=true;pp.hidden=false;
    $('#title').textContent='Start Signal';$('#subtitle').textContent='Admin · Players';
  }else{ // login
    ['#playersPanel','#upload','#publishPanel','#accountPanel'].forEach(s=>{const e=$(s);if(e)e.hidden=true});app.hidden=false;
  }
}
function loginForm(mode,err){
  document.body.classList.remove('authed');setView('login');
  $('#title').textContent='Start Signal';$('#subtitle').textContent='Admin sign-in';showLogo('',null);
  const s=savedCreds()||{};
  const f=(id,label,type,ac,val='')=>`<label>${label}<input id="${id}" type="${type}" autocomplete="${ac}" value="${esc(val)}" required></label>`;
  let body='';
  if(mode==='signin')body=`<h2>Admin sign-in</h2>${f('lUser','Username','text','username',s.u||'')}${f('lPass','Password','password','current-password',s.p||'')}
    <label class="rem"><input type="checkbox" id="lRem" ${s.u?'checked':''}> Remember on this device</label>
    <button class="btn primary" type="submit">Sign in</button>`;
  else if(mode==='setup')body=`<h2>Set up admin access</h2><p class="note">One-time setup. The GitHub token is stored encrypted and never asked for again unless it expires.</p>
    ${f('lToken','GitHub token','password','off')}${f('lUser','Choose a username','text','username')}${f('lPass','Choose a password (10+ characters)','password','new-password')}${f('lPass2','Confirm password','password','new-password')}
    <label class="rem"><input type="checkbox" id="lRem"> Remember on this device</label><button class="btn primary" type="submit">Create admin access</button>`;
  else if(mode==='upgrade')body=`<h2>Switch to username sign-in</h2><p class="note">One-time step: enter your current GitHub token and admin passphrase once, then choose the username and password you'll use from now on. Existing player reports keep working.</p>
    ${f('lToken','GitHub token','password','off')}${f('lOld','Current admin passphrase','password','current-password')}${f('lUser','New username','text','username')}${f('lPass','New password (10+ characters)','password','new-password')}${f('lPass2','Confirm new password','password','new-password')}
    <label class="rem"><input type="checkbox" id="lRem"> Remember on this device</label><button class="btn primary" type="submit">Save and sign in</button>`;
  else if(mode==='token')body=`<h2>Replace GitHub token</h2><p class="note">The saved GitHub token no longer works (it may have expired). Paste a new one; your username and password stay the same.</p>
    ${f('lToken','New GitHub token','password','off')}<button class="btn primary" type="submit">Save token</button>`;
  $('#app').innerHTML=`<form class="gate card login" id="login">${body}<p class="msg ${err?'err':''}" id="lMsg" role="status">${esc(err||'')}</p></form>`;
  $('#login').addEventListener('submit',ev=>{ev.preventDefault();submitLogin(mode)});
  const first=$('#login input:not([type=checkbox])');(s.u&&mode==='signin'?$('#lPass'):first)?.focus();
}
function loginScreen(err){loginForm(ADMIN.mode||'signin',err)}
function savedCreds(){try{return JSON.parse(localStorage.getItem('ss-admin')||sessionStorage.getItem('ss-admin')||'null')}catch(e){return null}}
function remember(u,p,persist){try{localStorage.removeItem('ss-admin');sessionStorage.removeItem('ss-admin');(persist?localStorage:sessionStorage).setItem('ss-admin',JSON.stringify({u,p}))}catch(e){}}
const normUser=u=>String(u||'').trim().toLowerCase();
const credKey=(u,p,salt)=>passKey(normUser(u)+'\u0000'+p,salt);
async function v1Master(pass,salt){
  const km=await crypto.subtle.importKey('raw',te.encode(pass),'PBKDF2',false,['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},km,256));
}
async function writeAdmin(u,p,token,mk,message){
  const salt=rnd(16),box=await enc(await credKey(u,p,salt),te.encode(JSON.stringify({u:normUser(u),token,mk:b64(mk)})));
  await ghPut('admin.json',JSON.stringify({v:2,salt:b64(salt),box}),message);
  ADMIN.file={v:2,salt:b64(salt),box};
}
async function checkToken(token){
  const prev=GH.token;GH.token=token;
  try{const r=await(await gh('')).json();if(!r.permissions?.push)throw new Error('That GitHub token can\u2019t save files here. It needs Contents: Read and write on this repository.')}
  catch(e){GH.token=prev;if(e.status===401)throw new Error('GitHub rejected that token.');if(e.status===404)throw new Error('That GitHub token doesn\u2019t have access to this repository.');throw e}
}
async function fetchAdminFile(){
  try{
    const r=await fetch(`https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/admin.json?ref=${encodeURIComponent(GH.branch)}`,{cache:'no-store',headers:{Accept:'application/vnd.github.raw'}});
    if(r.status===404)return null;if(r.ok)return JSON.parse(await r.text());
  }catch(e){}
  const r=await fetch('admin.json',{cache:'no-store'});
  if(r.status===404)return null;if(r.ok)return r.json();
  throw new Error('Can\u2019t reach the sign-in service right now. Try again in a minute.');
}
async function initAdmin(){
  const d=detectRepo();
  GH.owner=CONFIG.owner||d.owner||'';GH.repo=CONFIG.repo||d.repo||'';GH.branch=CONFIG.branch||'';
  if(!GH.owner||!GH.repo){$('#app').innerHTML='<div class="empty">Open the tool from its published web address to sign in.</div>';return}
  if(!GH.branch){try{const r=await fetch(`https://api.github.com/repos/${GH.owner}/${GH.repo}`,{cache:'no-store'});if(r.ok)GH.branch=(await r.json()).default_branch}catch(e){}GH.branch=GH.branch||'main'}
  try{ADMIN.file=await fetchAdminFile()}catch(e){loginForm('signin',e.message);return}
  ADMIN.mode=!ADMIN.file?'setup':ADMIN.file.v===2?'signin':'upgrade';
  const s=savedCreds();
  if(ADMIN.mode==='signin'&&s?.u&&s?.p){loginForm('signin');submitLogin('signin',true)}else loginForm(ADMIN.mode);
}
async function submitLogin(mode,auto){
  const val=id=>$(id)?.value??'';const msg=$('#lMsg');msg.className='msg';msg.textContent='Checking\u2026';
  const persist=$('#lRem')?.checked;
  try{
    if(mode==='signin'){
      const u=val('#lUser'),p=val('#lPass'),a=ADMIN.file;let box;
      try{box=JSON.parse(td.decode(await dec(await credKey(u,p,unb64(a.salt)),a.box)))}catch(e){throw new Error('Wrong username or password.')}
      Object.assign(ADMIN,{user:box.u,pass:p,mk:unb64(box.mk)});ADMIN.key=await rawKey(ADMIN.mk);
      remember(box.u,p,auto?!!localStorage.getItem('ss-admin'):persist);
      try{await checkToken(box.token)}catch(e){ADMIN.mode='token';loginForm('token');return}
      return enterAdmin();
    }
    if(mode==='token'){await checkToken(val('#lToken').trim());await writeAdmin(ADMIN.user,ADMIN.pass,GH.token,ADMIN.mk,'Replace admin GitHub token');ADMIN.mode='signin';return enterAdmin()}
    const u=normUser(val('#lUser')),p=val('#lPass');
    if(!/^[a-z0-9._@-]{3,}$/.test(u))throw new Error('Use a username of at least 3 letters, numbers or . _ - @');
    if(p.length<10)throw new Error('Use a password of at least 10 characters.');
    if(p!==val('#lPass2'))throw new Error('The passwords don\u2019t match.');
    await checkToken(val('#lToken').trim());
    let mk;
    if(mode==='setup'){mk=rnd(32)}
    else{ // upgrade from passphrase version: same master key, so existing reports still open
      const a=ADMIN.file,old=val('#lOld'),salt=unb64(a.salt);
      try{if(td.decode(await dec(await passKey(old,salt),a.check))!==CHECK)throw 0}catch(e){throw new Error('That isn\u2019t the current admin passphrase.')}
      mk=await v1Master(old,salt);
    }
    await writeAdmin(u,p,GH.token,mk,mode==='setup'?'Set up admin access':'Switch admin to username sign-in');
    if(mode==='setup'&&!(await ghFile('.nojekyll')))await ghPut('.nojekyll','\n','Serve files as-is');
    Object.assign(ADMIN,{user:u,pass:p,mk,mode:'signin'});ADMIN.key=await rawKey(mk);remember(u,p,persist);
    enterAdmin();
  }catch(e){console.error(e);if(auto){loginForm('signin');return}msg.className='msg err';msg.textContent=e.message}
}
function signOut(){
  try{localStorage.removeItem('ss-admin');sessionStorage.removeItem('ss-admin')}catch(e){}
  Object.assign(ADMIN,{key:null,mk:null,pass:null,players:[],cur:null,staged:false,mode:'signin'});M=null;resetSources();GH.token='';
  $('#accountPanel').hidden=true;loginForm('signin');
}
function enterAdmin(){
  document.body.classList.add('authed');
  M=null;showLogo('',null);showPlayers();refreshPlayers();
}
function openAccount(){
  const p=$('#accountPanel');if(!p.hidden){p.hidden=true;return}
  $('#aUser').value=ADMIN.user;['#aCur','#aNew','#aNew2','#aToken'].forEach(s=>$(s).value='');$('#aMsg').textContent='';$('#aMsg').className='msg';
  p.hidden=false;$('#aUser').focus();
}
async function saveAccount(){
  const msg=$('#aMsg'),val=id=>$(id).value;msg.className='msg';msg.textContent='Saving\u2026';
  try{
    if(val('#aCur')!==ADMIN.pass)throw new Error('Current password is incorrect.');
    const u=normUser(val('#aUser'));if(!/^[a-z0-9._@-]{3,}$/.test(u))throw new Error('Use a username of at least 3 letters, numbers or . _ - @');
    let p=ADMIN.pass;
    if(val('#aNew')||val('#aNew2')){if(val('#aNew').length<10)throw new Error('Use a new password of at least 10 characters.');if(val('#aNew')!==val('#aNew2'))throw new Error('The new passwords don\u2019t match.');p=val('#aNew')}
    if(val('#aToken').trim())await checkToken(val('#aToken').trim());
    await writeAdmin(u,p,GH.token,ADMIN.mk,'Update admin sign-in');
    const persisted=!!localStorage.getItem('ss-admin');Object.assign(ADMIN,{user:u,pass:p});remember(u,p,persisted);
    ['#aCur','#aNew','#aNew2','#aToken'].forEach(s=>$(s).value='');
    msg.textContent='Saved. Use the new sign-in from now on.';
  }catch(e){console.error(e);msg.className='msg err';msg.textContent=e.message}
}
function showPlayers(){closeStage();setView('players');renderPlayers()}
function closeStage(){$('#upload').hidden=true;$('#publishPanel').hidden=true}
function startUpload(player){
  ADMIN.cur=player||null;ADMIN.staged=false;resetSources();
  $('#uploadTitle').textContent=player?`Upload new files for ${player.meta.name}`:'Upload files for a new player';
  $('#publishPanel').hidden=true;$('#upload').hidden=false;renderPlayers();
  $('#upload').scrollIntoView({block:'nearest'});
}

/* ---------- names ---------- */
const SUFFIX=/^(jr\.?|sr\.?|ii|iii|iv|v)$/i;
function nameParts(n){
  const p=String(n||'').trim().split(/\s+/);if(p.length<2)return{first:'',last:p[0]||''};
  let li=p.length-1;const suf=SUFFIX.test(p[li])&&li>1?p[li--]:'';
  return{first:p.slice(0,li).join(' '),last:p[li]+(suf?' '+suf:'')};
}
const lastFirst=n=>{const{first,last}=nameParts(n);return first?`${last}, ${first}`:last};

/* ---------- players list ---------- */
async function refreshPlayers(){
  const box=$('#playersList');box.innerHTML='<p class="meta">Loading players\u2026</p>';
  try{
    const dirs=(await ghList('players')).filter(x=>x.type==='dir');
    ADMIN.players=await Promise.all(dirs.map(async d=>{
      try{const env=JSON.parse(await ghRaw(`players/${d.name}/report.json`));return{slug:d.name,env,meta:await readMeta(env,ADMIN.key)}}
      catch(e){return{slug:d.name,error:e.status===404?'No report file':'Can\u2019t unlock this report with the current admin key'}}
    }));
    const key=p=>(p.meta?lastFirst(p.meta.name):'\uffff'+p.slug).toLowerCase();
    ADMIN.players.sort((a,b)=>key(a).localeCompare(key(b)));
    if(ADMIN.cur)ADMIN.cur=ADMIN.players.find(p=>p.slug===ADMIN.cur.slug)||null;
    renderPlayers();
  }catch(e){console.error(e);box.innerHTML=`<p class="msg err">${esc(e.message)}</p>`}
}
const fdt=s=>s?new Date(s).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'—';
function renderPlayers(){
  const box=$('#playersList');if(!box)return;
  if(!ADMIN.players.length){box.innerHTML='<p class="meta">No player folders yet. Click <b>New player</b> to upload the first one.</p>';return}
  box.innerHTML=`<div class="tblwrap"><table class="ptab"><thead><tr><th>Player</th><th>Link</th><th>Password</th><th>Updated</th><th></th></tr></thead><tbody>${ADMIN.players.map((p,i)=>p.error?
    `<tr><td colspan="4"><b>${esc(p.slug)}</b> <span class="meta">${esc(p.error)}</span></td><td><div class="acts"><button class="btn sm danger" data-del="${i}">Delete</button></div></td></tr>`:
    `<tr class="${ADMIN.cur?.slug===p.slug&&!$('#upload').hidden?'cur':''}"><td><b>${esc(lastFirst(p.meta.name))}</b><small>${esc(p.meta.team||'')}</small></td>
      <td><a href="${esc(playerURL(p.slug))}" target="_blank" rel="noopener">players/${esc(p.slug)}/</a> <button class="btn sm" data-copy="${esc(playerURL(p.slug))}">Copy link</button></td>
      <td><code class="pw" data-pw="${i}">••••••••</code> <button class="btn sm" data-show="${i}">Show</button> <button class="btn sm" data-copy="${esc(p.meta.password)}">Copy</button></td>
      <td>${fdt(p.env.updated)}</td>
      <td><div class="acts"><button class="btn sm primary" data-open="${i}">Open</button><button class="btn sm" data-upd="${i}">Upload new files</button><button class="btn sm" data-pass="${i}">Change password</button><button class="btn sm danger" data-del="${i}">Delete</button></div></td></tr>`).join('')}</tbody></table></div>`;
  box.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>copy(b.dataset.copy,b)));
  box.querySelectorAll('[data-show]').forEach(b=>b.addEventListener('click',()=>{const c=box.querySelector(`[data-pw="${b.dataset.show}"]`);const shown=b.textContent==='Hide';c.textContent=shown?'••••••••':ADMIN.players[+b.dataset.show].meta.password;b.textContent=shown?'Show':'Hide'}));
  box.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openPlayer(+b.dataset.open)));
  box.querySelectorAll('[data-upd]').forEach(b=>b.addEventListener('click',()=>startUpload(ADMIN.players[+b.dataset.upd])));
  box.querySelectorAll('[data-pass]').forEach(b=>b.addEventListener('click',()=>changePassword(+b.dataset.pass)));
  box.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>deletePlayer(+b.dataset.del)));
}
function copy(text,btn){navigator.clipboard?.writeText(text).then(()=>{const t=btn.textContent;btn.textContent='Copied';setTimeout(()=>btn.textContent=t,1200)}).catch(()=>prompt('Copy:',text))}
async function openPlayer(i){
  const p=ADMIN.players[i];
  try{closeStage();ADMIN.staged=false;loadPayload(await openAsAdmin(p.env,ADMIN.key));setView('report')}
  catch(e){console.error(e);alert('Could not open this report: '+e.message)}
}
async function changePassword(i){
  const p=ADMIN.players[i];const np=prompt(`New password for ${p.meta.name}:`,`${rand(4)}-${rand(4)}`);
  if(!np)return;if(np.length<6){alert('Use at least 6 characters.');return}
  try{
    const meta={...p.meta,password:np};const env=await rewrapPlayer(p.env,ADMIN.key,np,meta);
    await ghPut(`players/${p.slug}/report.json`,JSON.stringify(env),`Change password: ${p.slug}`);
    Object.assign(p,{env,meta});renderPlayers();
  }catch(e){console.error(e);alert('Could not change the password: '+e.message)}
}
async function deletePlayer(i){
  const p=ADMIN.players[i];if(!confirm(`Delete ${p.meta?.name||p.slug}'s folder? The link will stop working.`))return;
  try{for(const f of await ghList(`players/${p.slug}`))await ghDel(f.path,f.sha,`Delete ${p.slug}`);
    if(ADMIN.cur?.slug===p.slug){ADMIN.cur=null;closeStage()}await refreshPlayers()}
  catch(e){console.error(e);alert('Could not delete: '+e.message)}
}

/* ---------- publish ---------- */
function openPublish(){
  if(!M)return;const c=ADMIN.cur;
  $('#pubWho').textContent=M.name;
  $('#pubInfo').textContent=`${M.throws==='L'?'LHP':'RHP'} · ${M.team||''} · ${M.games.length} appearances (${M.yearRange})`;
  $('#pubTarget').innerHTML=c?`Replaces the report in <b>${esc(lastFirst(c.meta.name))}</b>'s folder <code>players/${esc(c.slug)}/</code>. Link and password stay the same unless you change the password here.`:'Creates a new player folder.';
  const fs=$('#pubSlug');fs.value=c?c.slug:`p-${rand(8)}`;fs.disabled=!!c;
  $('#pubPass').value=c?c.meta.password:`${rand(4)}-${rand(4)}`;
  $('#pubMsg').className='msg';$('#pubMsg').innerHTML='';$('#pubGo').disabled=false;
  $('#publishPanel').hidden=false;$('#publishPanel').scrollIntoView({block:'nearest'});
}
async function publish(){
  const msg=$('#pubMsg'),c=ADMIN.cur;
  if(!ADMIN.staged||!M){msg.className='msg err';msg.textContent='Upload the files first.';return}
  const slug=($('#pubSlug').value||'').toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'');
  const pass=$('#pubPass').value;
  if(!slug){msg.className='msg err';msg.textContent='Enter a folder name.';return}
  if(pass.length<6){msg.className='msg err';msg.textContent='Use a password of at least 6 characters.';return}
  if(!c&&ADMIN.players.some(p=>p.slug===slug)){msg.className='msg err';msg.textContent='That folder already exists. Use "Upload new files" on that player instead.';return}
  if(c&&c.meta.name!==M.name&&!confirm(`These files are for ${M.name}, but the folder belongs to ${c.meta.name}. Publish anyway?`))return;
  msg.className='msg';msg.textContent='Encrypting and publishing\u2026';$('#pubGo').disabled=true;
  try{
    const meta={name:M.name,team:M.team,password:pass,slug,created:c?.meta.created||new Date().toISOString()};
    const env=await makeEnvelope(buildPayload(),pass,ADMIN.key,meta);
    await ghPut(`players/${slug}/report.json`,JSON.stringify(env),`${c?'Update':'Create'} report: ${slug}`);
    await ghPut(`players/${slug}/index.html`,playerPage(),`Player page: ${slug}`);
    const url=playerURL(slug);
    $('#upload').hidden=true;ADMIN.staged=false;
    msg.innerHTML=`Published ${esc(M.name)}. Link: <a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a> <button class="btn sm" id="cpL">Copy link</button> · Password: <code>${esc(pass)}</code> <button class="btn sm" id="cpP">Copy</button> <button class="btn sm" id="pubDone">Done</button><br><span class="meta">GitHub Pages usually shows the update within a few minutes.</span>`;
    on('#cpL','click',e=>copy(url,e.target));on('#cpP','click',e=>copy(pass,e.target));on('#pubDone','click',()=>{ADMIN.cur=null;closeStage();renderPlayers()});
    ADMIN.cur={slug};await refreshPlayers();
  }catch(e){console.error(e);msg.className='msg err';msg.textContent='Could not publish: '+e.message;$('#pubGo').disabled=false}
}
function playerPage(){
  const method=(document.querySelector('.method')?.outerHTML||'').replace('<details class="method"','<details class="method" hidden');
  const fonts=[...document.querySelectorAll('link[href*="fonts.g"]')].map(l=>l.outerHTML).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>Player report</title>
${fonts}
<link rel="stylesheet" href="../../styles.css">
<script src="../../papaparse.min.js"><\/script>
</head>
<body data-mode="player">
<div class="wrap">
  <header class="top">
    <div class="hlogo" id="hlogo" aria-hidden="true"></div>
    <div class="brand"><h1 id="title">Player report</h1><p id="subtitle"></p></div>
  </header>
  <main id="app"><div class="empty">Loading\u2026</div></main>
  ${method}
  <p class="updated" id="updated" hidden></p>
</div>
<script src="../../app.js"><\/script>
</body>
</html>
`;
}

/* ---------- admin wiring ---------- */
function wireAdmin(){
  let forced=null;
  document.querySelectorAll('.slot[data-slot]').forEach(s=>{
    s.addEventListener('click',()=>{forced=s.dataset.slot;$('#fileAny').click()});
    s.addEventListener('dragover',e=>{e.preventDefault();s.classList.add('drag')});
    s.addEventListener('dragleave',()=>s.classList.remove('drag'));
    s.addEventListener('drop',e=>{e.preventDefault();s.classList.remove('drag');handleFiles(e.dataTransfer.files,s.dataset.slot)});
  });
  on('#fileAny','change',e=>{handleFiles(e.target.files,forced);forced=null;e.target.value=''});
  on('#pickAll','click',()=>{forced=null;$('#fileAny').click()});
  on('#logoSlot','click',()=>$('#logoFile').click());
  on('#logoFile','change',async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;const d=await readDataURL(f);if(M&&ADMIN.staged)saveLogo(M.team,d);else{pendingLogo=d;showLogo('',d)}});
  const drop=$('#drop');
  if(drop){drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag')});drop.addEventListener('dragleave',()=>drop.classList.remove('drag'));
    drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('drag');handleFiles(e.dataTransfer.files)})}
  on('#backBtn','click',showPlayers);
  on('#newPlayer','click',()=>startUpload(null));
  on('#refreshPlayers','click',refreshPlayers);
  on('#cancelUpload','click',()=>{ADMIN.cur=null;ADMIN.staged=false;resetSources();closeStage();renderPlayers()});
  on('#cancelPublish','click',()=>{ADMIN.cur=null;ADMIN.staged=false;resetSources();closeStage();renderPlayers()});
  on('#signOut','click',signOut);
  on('#accountBtn','click',openAccount);
  on('#aSave','click',saveAccount);
  on('#aCancel','click',()=>{$('#accountPanel').hidden=true});
  on('#pubGo','click',publish);
  on('#pubGen','click',()=>{$('#pubPass').value=`${rand(4)}-${rand(4)}`});
}

/* ---------- boot ---------- */
if(MODE==='player')bootPlayer();
else{wireAdmin();initAdmin()}
