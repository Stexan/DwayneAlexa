from flask_api import FlaskAPI
import computer_vision
from multiprocessing.pool import ThreadPool


app = FlaskAPI(__name__)
#workout_thread = threading.Thread(target=computer_vision.start_workout, args=(), kwargs={})
workout_pool = ThreadPool(processes=1)
async_result = None

@app.route('/dwayne_alexa/start')
def start_workout_api():
    global workout_pool, async_result

    async_result = workout_pool.apply_async(computer_vision.start_workout, ()) # tuple of args for foo

    #stats = computer_vision.start_workout()
    return {'dwayne': "the rock"}

@app.route('/dwayne_alexa/stats')
def get_stats_api():
    global async_result
    if async_result != None:
        stats = async_result.get()
        return {'squats': stats}
    else:
        return {'ERROR': "Don't have any stats"}


if __name__ == "__main__":
    app.run(debug=True)
