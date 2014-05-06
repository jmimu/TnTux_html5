#!/bin/bash

#use vertical strips for flop, and hz strip for flip...

for f in *.png
do
convert $f -scale 200% ../${f%.png}_1.png
convert ../${f%.png}_1.png -flop ../${f%.png}_2.png
convert ../${f%.png}_1.png -flip ../${f%.png}_3.png
#convert ../${f%.png}_1.png -flip -flop ../${f%.png}_4.png
done


