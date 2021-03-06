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


#import imageio
##imageio.plugins.ffmpeg.download() #on first run only

#Set constants
RATIO = 100
RAD = 25
W = 600
H = 400
H_outer = 500
D = 35#30 # duration
N_OBJ=4

#load file list
files = listdir('../R/data/replay_files_exp4')
#Extract uid and participant number
ids = []
ppts = []
for i in range(0, len(files)):
    start = files[i].find('A')
    stop = files[i].find('.json')
    ids.append(files[i][start:stop])
    start = files[i].find('_')
    stop = files[i].find('_', start+1) #+ start
    tmp = files[i][(start+1):stop]
    if len(tmp)==1:
        tmp = '0' + tmp
    ppts.append(tmp)
print ppts

#Load settings
with open('../R/data/replay_files_exp4/stim.json') as data_file:    
    stim = json.load(data_file)

#Load responses (these are in chronological trial order consistent with the inner trial loop)
with open('e45_resps.json') as data_file:    
    resps = json.load(data_file)

#Loop over participants
for ppt in range(1, (len(files)-1)):
    #range(0,1):
    #range(0, (len(files)-1)):
    
    print 'now creating video for' + files[ppt]

    #Load their physics data
    with open('../R/data/replay_files_exp4/' + files[ppt]) as data_file:    
        data = json.load(data_file)
    
    #Select their details
    ppt_details = stim["details"][ids[ppt]]
    ppt_resps = resps[ids[ppt]]

    #Create a directory for this participant if not one already
    directory = 'P' + str(ppts[ppt]) + '_' + ids[ppt]
    if not os.path.exists(directory):
        os.makedirs(directory)

    #Loop over trials
    for trial in range(0,20):
        #(0,20)
        #Select the specific trial's data
        this_data = data[trial]
        this_details = ppt_details[trial]

        print this_details
        #print this_data #BIG!

        colors = list()
        for col in range(0,N_OBJ):
            colors.append(colorsys.hls_to_rgb(h=float(this_details["hues"][col])/360, l=0.7, s=0.8))
        
        #print colors, np.random.rand(N_OBJ, 3)
        labels = ['A','B','','']

        centers = np.array([["o1.x", "o1.y"],
                            ["o2.x", "o2.y"],
                            ["o3.x", "o3.y"],
                            ["o4.x", "o4.y"]])
        #random.randint(0,W, (nballs,2))

        def make_frame(t):
            
            frame = int(math.floor(t*60))+10 #Skip the first 10 frames (where things are still realigning)
            #print frame

            if frame >= len(this_data["frame"]):
                frame = len(this_data["frame"])-1

            #White background
            surface = gz.Surface(W,H_outer, bg_color=(1,1,1))            
            
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
                


                xy = np.array([this_data[center[0]][frame]*RATIO, this_data[center[1]][frame]*RATIO])
                #print xy

                #angle = 2*np.pi*(t/D*np.sign(color[0]-.5)+color[1])
                #xy = center+gz.polar2cart(W/5,angle) # center of the ball
                # gradient = gz.ColorGradient(type="radial",
                #              stops_colors = [(0,color),(1,color/10)],
                #              xy1=[0.3,-0.3], xy2=[0,0], xy3 = [0,1.4])

                ball = gz.circle(r=RAD, fill=color).translate(xy)
                ball.draw(surface)

                #Letters
                text = gz.text(label, fontfamily="Helvetica",  fontsize=25, fontweight='bold', fill=(0,0,0), xy=xy) #, angle=Pi/12
                text.draw(surface)

            #Mouse cursor
            cursor_xy = np.array([this_data['mouseX'][frame]/this_details["zoom"], this_data['mouseY'][frame]/this_details["zoom"]])
            cursor = gz.text('+', fontfamily="Helvetica",  fontsize=25, fill=(0,0,0), xy=cursor_xy) #, angle=Pi/12
            cursor.draw(surface)
            
            #Control
            if this_data['idControlledObject'][frame]!='none':
                if this_data['idControlledObject'][frame]=='object1':
                    xy = np.array([this_data['o1.x'][frame]*RATIO, this_data['o1.y'][frame]*RATIO])
                elif this_data['idControlledObject'][frame]=='object2':
                    xy = np.array([this_data['o2.x'][frame]*RATIO, this_data['o2.y'][frame]*RATIO])
                elif this_data['idControlledObject'][frame]=='object3':
                    xy = np.array([this_data['o3.x'][frame]*RATIO, this_data['o3.y'][frame]*RATIO])
                elif this_data['idControlledObject'][frame]=='object4':
                    xy = np.array([this_data['o4.x'][frame]*RATIO, this_data['o4.y'][frame]*RATIO])

                #control_border = gz.arc(r=RAD, a1=0, a2=np.pi, fill=(0,0,0)).translate(xy)
                control_border = gz.circle(r=RAD,  stroke_width= 2).translate(xy)
                control_border.draw(surface)
            
            #Decision point
            if ppt_resps["active"]["resptime"][trial] < t or (int(math.floor(t*60))+10) >= len(this_data["frame"]):

                ans = 'active: ' + ppt_resps["active"]["answer"][trial] + ' at ' + str(ppt_resps["active"]["resptime"][trial])
                if ppt_resps["active"]["cor"][trial]==1:
                    fillc = [0.1,1,0.1]
                else:
                    fillc = [1,0.1,0.1]
                text = gz.text(ans, fontfamily="Helvetica",  fontsize=15, fill=fillc, xy=(W/2, 420)) #, angle=Pi/12
                text.draw(surface)

            if ppt_resps["yokedSame"]["resptime"][trial]<t or (int(math.floor(t*60))+10) >= len(this_data["frame"]):

                if ppt_resps["yokedSame"]["cor"][trial]==1:
                    fillc = [0.1,1,0.1]
                else:
                    fillc = [1,0.1,0.1]
                ans = 'same: ' + ppt_resps["yokedSame"]["answer"][trial] + ' at ' + str(ppt_resps["yokedSame"]["resptime"][trial])
                text = gz.text(ans, fontfamily="Helvetica",  fontsize=15, fill=fillc, xy=(W/2, 440)) #, angle=Pi/12
                text.draw(surface)

            if ppt_resps["yokedFlip"]["resptime"][trial]<t or (int(math.floor(t*60))+10) >= len(this_data["frame"]):

                if ppt_resps["yokedFlip"]["cor"][trial]==1:
                    fillc = [0.1,1,0.1]
                else:
                    fillc = [1,0.1,0.1]
                ans = 'flipped: ' + ppt_resps["yokedFlip"]["answer"][trial] + ' at ' + str(ppt_resps["yokedFlip"]["resptime"][trial])
                text = gz.text(ans, fontfamily="Helvetica",  fontsize=15, fill=fillc, xy=(W/2, 460)) #, angle=Pi/12
                text.draw(surface)

            return surface.get_npimage()  

        #Create the clip
        clip = mpy.VideoClip(make_frame, duration=D)#, fps=60?\

        #Create the filename (adding 0s to ensure things are in a nice alphabetical order now)
        trialstring = str(trial+1)
        if len(trialstring)==1:
            trialstring = '0' + trialstring

        if (trial==0 or trial==10):
            trialstring = trialstring + 'practice'

        writename = directory + '/' + 't' + trialstring + '_' + this_details['questionOrig'][0] + '_w' + str(this_details['worldId'])   + '.mp4'
        print writename

        #Write the clip to file
        clip.write_videofile(writename, fps=24)#
        #clip.write_gif("balls.gif",fps=15,opt="OptimizePlus")