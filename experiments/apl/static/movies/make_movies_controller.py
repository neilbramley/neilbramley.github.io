"""convert physics data to movie"""

#make_movies.py

import json
import math
import colorsys
import os
import gizeh as gz
import numpy as np
import moviepy.editor as mpy

from os import listdir


#Set constants
RATIO = 100
RAD = 25
W = 600
H = 400
# H_outer = 500
N_OBJ=2

for i in range(0,10):
    #Load data
    with open('../json/test_sim' + str(i) + '.json') as data_file:    
        data = json.load(data_file)

    this_data = data['physics']

    colors = [(1,0,0,),(0,1,0),(0,0,1),(0,0,1)]

    #print colors, np.random.rand(N_OBJ, 3)
    labels = ['A','B','','']

    centers = np.array(['o1','o2','o3','o4'])
    #random.randint(0,W, (nballs,2))

    def make_frame(t):
        
        frame = int(math.floor(t*30))#*60
        print frame

        #Essentially pauses the action if there are no more frames and but more clip duration
        if frame >= len(this_data["co"]):
            frame = len(this_data["co"])-1

        #White background
        surface = gz.Surface(W,H, bg_color=(1,1,1))            
        
        #Walls
        wt = gz.rectangle(lx=W, ly=20, xy=(W/2,10), fill=(0,0,0))#, angle=Pi/8
        wb = gz.rectangle(lx=W, ly=20, xy=(W/2,H-10), fill=(0,0,0))
        wl = gz.rectangle(lx=20, ly=H, xy=(10,H/2), fill=(0,0,0))
        wr = gz.rectangle(lx=20, ly=H, xy=(W-10,H/2), fill=(0,0,0))
        wt.draw(surface)
        wb.draw(surface)
        wl.draw(surface)
        wr.draw(surface)

        #Pucks
        for label, color, center in zip(labels, colors, centers):

            xy = np.array([this_data[center]['x'][frame]*RATIO, this_data[center]['y'][frame]*RATIO])

            ball = gz.circle(r=RAD, fill=color).translate(xy)
            ball.draw(surface)

            #Letters
            text = gz.text(label, fontfamily="Helvetica",  fontsize=25, fontweight='bold', fill=(0,0,0), xy=xy) #, angle=Pi/12
            text.draw(surface)

        #Mouse cursor
        cursor_xy = np.array([this_data['mouse']['x'][frame]*RATIO, this_data['mouse']['y'][frame]*RATIO])
        cursor = gz.text('+', fontfamily="Helvetica",  fontsize=25, fill=(0,0,0), xy=cursor_xy) #, angle=Pi/12
        cursor.draw(surface)
        
        #Control
        if this_data['co'][frame]!=0:
            if this_data['co'][frame]==1:
                xy = np.array([this_data['o1']['x'][frame]*RATIO, this_data['o1']['y'][frame]*RATIO])
            elif this_data['co'][frame]==2:
                xy = np.array([this_data['o2']['x'][frame]*RATIO, this_data['o2']['y'][frame]*RATIO])
            elif this_data['co'][frame]==3:
                xy = np.array([this_data['o3']['x'][frame]*RATIO, this_data['o3']['y'][frame]*RATIO])
            elif this_data['co'][frame]==4:
                xy = np.array([this_data['o4']['x'][frame]*RATIO, this_data['o4']['y'][frame]*RATIO])

            #control_border = gz.arc(r=RAD, a1=0, a2=np.pi, fill=(0,0,0)).translate(xy)
            control_border = gz.circle(r=RAD,  stroke_width= 2).translate(xy)
            control_border.draw(surface)
        
        return surface.get_npimage()  

    #Create the clip
    duration = len(this_data['co'])/30
    clip = mpy.VideoClip(make_frame, duration=duration)#, fps=60?\

    #Create the filename (adding 0s to ensure things are in a nice alphabetical order now)
    writename = 'example_control' + str(i) + '.mp4'
    print writename

    #Write the clip to file
    clip.write_videofile(writename, fps=24)#
    #clip.write_gif("balls.gif",fps=15,opt="OptimizePlus")
