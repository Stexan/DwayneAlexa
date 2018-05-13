import numpy as np
import cv2
from time import time

# workout sample
workout_move =  [3, 2, 1, 3, 1, 1, 3, 1, 3, 1, 3, 2, 1]
workout_time = [2,   5,  8, 11, 14, 17, 20, 22, 24, 25, 26, 27, 28]

class BackGroundSubtractor:
    # When constructing background subtractor, we
    # take in two arguments:
    # 1) alpha: The background learning factor, its value should
    # be between 0 and 1. The higher the value, the more quickly
    # your program learns the changes in the background. Therefore,
    # for a static background use a lower value, like 0.001. But if
    # your background has moving trees and stuff, use a higher value,
    # maybe start with 0.01.
    # 2) firstFrame: This is the first frame from the video/webcam.
    def __init__(self,alpha,firstFrame):
        self.alpha  = alpha
        self.backGroundModel = firstFrame


    def getForeground(self,frame):
        # apply the background averaging formula:
        # NEW_BACKGROUND = CURRENT_FRAME * ALPHA + OLD_BACKGROUND * (1 - APLHA)
        self.backGroundModel =  frame * self.alpha + self.backGroundModel * (1 - self.alpha)

        # after the previous operation, the dtype of
        # self.backGroundModel will be changed to a float type
        # therefore we do not pass it to cv2.absdiff directly,
        # instead we acquire a copy of it in the uint8 dtype
        # and pass that to absdiff.

        return cv2.absdiff(self.backGroundModel.astype(np.uint8),frame)

# simple function to filter the original frame
def denoise(frame):
    frame = cv2.medianBlur(frame,5)
    frame = cv2.GaussianBlur(frame,(5,5),0)

    return frame

# decides whether the exercise was performed correctly or not
def get_feedback(move, last_moves):

    print last_moves
    if len(last_moves) >=5:
        last_moves.sort()
        x = sum(last_moves[:5]) / float(len(last_moves[:5]))
    elif len(last_moves) > 0:
        last_moves.sort()

        x = sum(last_moves) / float(len(last_moves))
    else:
        return False, "No movement"
    print x

    if move == 3:
        if x < 180:
            return True, "The rock approves"
        else:
            return False, "Wrong"
    elif move == 2:
        return True, "The rock approves"
    elif move == 1:
        if x > 180:
            return True, "The rock approves"
        else:
            return False, "Wrong"
    else:
        return True, "WRONG STATE!!" # it will never reach here, hopefully

# the main workout loop
def start_workout():
    # open main camera & read a first frame
    cam = cv2.VideoCapture(0)
    ret,frame = cam.read()

    # check if read correctly and proceed
    if ret is True:
        backSubtractor = BackGroundSubtractor(0.3, denoise(frame))
        run = True
        print "starting workout"
    else:
        print "A problem occured!!!"
        run = False


    # set up the blob detector with custom parameters.
    params = cv2.SimpleBlobDetector_Params()
    params.filterByArea = True
    params.minArea = 200  # the dot in 20pt font has area of about 30
    params.filterByCircularity = False
    params.minCircularity = 0.7
    params.filterByConvexity = False
    params.minConvexity = 0.8
    params.filterByInertia = False
    params.minInertiaRatio = 0.4
    detector = cv2.SimpleBlobDetector_create(params)

    # helper variables
    last_positions = []
    persistence = 20
    trigger = 0
    time_index = 0

    # start time counter
    start_time = time()

    #stats init.
    stats = []

    # start main loop
    while(run):
    	# read a frame from the camera
        ret,frame = cam.read()
        cv2.imshow('input', denoise(frame))

    	# if the frame was properly read.
        if ret is True:
            # show the filtered image
            cv2.imshow('input', denoise(frame))

            # get the foreground
            foreGround = backSubtractor.getForeground(denoise(frame))

            gray_image = cv2.cvtColor(foreGround, cv2.COLOR_BGR2GRAY)

            # apply thresholding on the background and display the resulting mask
            ret, mask = cv2.threshold(gray_image , 10, 255, cv2.THRESH_BINARY)

            # detect keypoints
            keypoints = detector.detect(mask)
            im_with_keypoints = cv2.drawKeypoints(mask, keypoints, np.array([]), (0,0,255), cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)

            cv2.imshow("Keypoints", im_with_keypoints)

            # analyze move if it is the time to do so (trigger)
            if persistence > 0 and trigger > 0:
                if time_index > 0:
                    open("workout_state","w").write(str(workout_move[time_index-1]) + "|" + str(True))

                persistence -= 1
                for k in keypoints:
                    last_positions.append(k.pt[1])
            elif persistence == 0:
                #give feedback
                result_bool, result_string = get_feedback(trigger, last_positions)
                stats.append(result_bool)
                print result_string
                if time_index > 0:
                    open("workout_state","w").write(str(workout_move[time_index-1]) + "|" + str(result_bool))
                else:
                    open("workout_state","w").write(str(1) + "|" + str(True))

                last_positions = []
                persistence = 20
                trigger = 0

            # test if it is time to trigger the validator
            now = time()
            time_passed = int(now - start_time)
            if time_passed > workout_time[time_index]:
                trigger = workout_move[time_index]
                time_index += 1
                print trigger
                if time_index >= len(workout_move):
                    break

        else:
            break

        # stop condition
        k = cv2.waitKey(30) & 0xff
        if k == 27:
            break

    cam.release()
    cv2.destroyAllWindows()
    open("workout_state", "w").write("")

    return stats
