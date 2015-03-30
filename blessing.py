#!/usr/bin/env python3

import melody
import foundation


# Build FurtherLand
furtherland = foundation.FurtherLand(melody)


# Rise FurtherLand
try:
    print("FurtherLand has been risen on %s:%s." % (melody.listen_ip,
                                                    str(melody.listen_port)))
    furtherland.rise()
except:
    furtherland.set()
    print("FurtherLand set.")
